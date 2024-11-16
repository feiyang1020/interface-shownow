import { BASE_MAN_URL, curNetwork, FLAG } from "@/config";
import { fetchCurrentBuzzComments, fetchCurrentBuzzLikes, getControlByContentPin, getDecryptContent, getPinDetailByPid } from "@/request/api";
import { GiftOutlined, HeartFilled, HeartOutlined, LockOutlined, MessageOutlined, PlusCircleFilled, UnlockFilled, UploadOutlined } from "@ant-design/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Card, Divider, Image, message, Space, Tag, Typography } from "antd";
import { isEmpty, isNil } from "ramda";
import { useMemo, useState } from "react";
import { useModel, history } from "umi";
import Comment from "../Comment";
import NewPost from "../NewPost";
import './index.less'
import ForwardTweet from "./ForwardTweet";
import { IMvcEntity } from "@metaid/metaid";
import { FollowIconComponent } from "../Follow";
import dayjs from "dayjs";
import { buildAccessPass } from "@/utils/buzz";
const { Paragraph, Text } = Typography;
import _btc from '@/assets/btc.png'

type Props = {
    buzzItem: API.Buzz
    showActions?: boolean,
    padding?: number
}

export default ({ buzzItem, showActions = true, padding=20 }: Props) => {
    const [showComment, setShowComment] = useState(false);
    const [showNewPost, setShowNewPost] = useState(false);
    const queryClient = useQueryClient();
    const { btcConnector, user, isLogin, connect, feeRate, chain, mvcConnector } = useModel('user');
    const { showConf, fetchServiceFee } = useModel('dashboard')
    const currentUserInfoData = useQuery({
        queryKey: ['userInfo', buzzItem!.address],
        queryFn: () =>
            btcConnector?.getUser({
                network: curNetwork,
                currentAddress: buzzItem!.address,
            }),
    });
    const summary = useMemo(() => {
        let _summary = buzzItem!.content;
        const isSummaryJson = _summary.startsWith('{') && _summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
        return isSummaryJson ? parseSummary.content : _summary;
    }, [buzzItem])

    const payBuzz = useMemo(() => {
        let _summary = buzzItem!.content;
        const isSummaryJson = _summary.startsWith('{') && _summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
        return isSummaryJson ? parseSummary : undefined;
    }, [buzzItem])
    const attachPids = useMemo(() => {
        const isFromBtc = buzzItem?.chainName === 'btc';
        let _summary = buzzItem!.content;
        const isSummaryJson = _summary.startsWith('{') && _summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
        return isSummaryJson && !isEmpty(parseSummary?.attachments ?? [])
            ? (parseSummary?.attachments ?? []).map(
                (d: string) => d.split('metafile://')[1]
            )
            : [];
    }, [buzzItem])

    const handleSpecial = (summary: string) => {
        summary = summary
            .replace('<metaid_flag>', 'metaid_flag')
            .replace('<operation>', 'operation')
            .replace('<path>', 'path')
            .replace('<encryption>', 'encryption')
            .replace('<version>', 'version')
            .replace('<content-type>', 'content-type')
            .replace('<payload>', 'payload');
        return summary;
    };

    const detectUrl = (summary: string) => {
        const urlReg = /(https?:\/\/[^\s]+)/g;

        const urls = summary.match(urlReg);

        if (urls) {
            urls.forEach(function (url) {
                summary = summary.replace(
                    url,
                    `<a href="${url}" target="_blank" style="text-decoration: underline;">${url}</a>`
                );
            });
        }

        return summary;
    };

    const { data: currentLikeData } = useQuery({
        queryKey: ['payLike', buzzItem!.id],
        queryFn: () =>
            fetchCurrentBuzzLikes({
                pinId: buzzItem!.id,
            }),
    });

    const isLikeByCurrentUser = (currentLikeData ?? [])?.find(
        (d) => d?.pinAddress === user?.address
    );

    const handleLike = async () => {
        const pinId = buzzItem!.id;
        if (!isLogin) {
            await connect()
            return
        }

        if (isLikeByCurrentUser) {
            message.error('You have already liked that buzz...');
            return;
        }


        try {
            if (chain === 'btc') {
                const likeEntity = await btcConnector!.use('like');
                const likeRes = await likeEntity.create({
                    dataArray: [
                        {
                            body: JSON.stringify({ isLike: '1', likeTo: pinId }),
                            flag: FLAG,
                            contentType: 'text/plain;utf-8',
                            path: `${showConf?.host || ''}/protocols/paylike`
                        },
                    ],
                    options: {
                        noBroadcast: 'no',
                        feeRate: Number(feeRate),
                        service: fetchServiceFee('like_service_fee_amount')
                    },
                });
                if (!isNil(likeRes?.revealTxIds[0])) {
                    queryClient.invalidateQueries({ queryKey: ['buzzes'] });
                    queryClient.invalidateQueries({ queryKey: ['payLike', buzzItem!.id] });
                    // await sleep(5000);
                    message.success('like buzz successfully');
                }
            } else {
                const likeEntity = (await mvcConnector!.use('like')) as IMvcEntity;
                console.log({
                    body: JSON.stringify({
                        isLike: '1',
                        likeTo: pinId,
                    }),
                    path: `${showConf?.host || ''}/protocols/paylike`,
                    'signMessage': 'like buzz',
                })
                const likeRes = await likeEntity.create({
                    data: {
                        body: JSON.stringify({
                            isLike: '1',
                            likeTo: pinId,
                        }),
                        path: `${showConf?.host || ''}/protocols/paylike`
                    },
                    options: {
                        network: curNetwork,
                        signMessage: 'like buzz',
                    },
                })
                console.log('likeRes', likeRes)
                if (!isNil(likeRes?.txid)) {
                    queryClient.invalidateQueries({ queryKey: ['buzzes'] })
                    queryClient.invalidateQueries({
                        queryKey: ['payLike', buzzItem!.id],
                    })
                    // await sleep(5000);
                    message.success('like buzz successfully')
                }
            }


        } catch (error) {
            console.log('error', error);
            const errorMessage = (error as any)?.message ?? error;
            const toastMessage = errorMessage?.includes(
                'Cannot read properties of undefined'
            )
                ? 'User Canceled'
                : errorMessage;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error(toastMessage);
        }
    };
    const quotePinId = useMemo(() => {
        let _summary = buzzItem!.contentSummary;
        const isSummaryJson = _summary.startsWith('{') && _summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
        return isSummaryJson && !isEmpty(parseSummary?.quotePin ?? '')
            ? parseSummary.quotePin
            : '';
    }, [buzzItem])

    const commentData = useQuery({
        enabled: !isNil(buzzItem?.id),
        queryKey: ['comment-detail', buzzItem!.id],
        queryFn: () => fetchCurrentBuzzComments({ pinId: buzzItem!.id }),
    })

    const { isLoading: isQuoteLoading, data: quoteDetailData } = useQuery({
        enabled: !isEmpty(quotePinId),
        queryKey: ['buzzDetail', quotePinId],
        queryFn: () => getPinDetailByPid({ pid: quotePinId }),
    })

    const { data: accessControl } = useQuery({
        enabled: !isEmpty(payBuzz),
        queryKey: ['buzzAccessControl', buzzItem!.id],
        queryFn: () => getControlByContentPin({ pinId: buzzItem!.id }),
    })

    const { data: decryptContent } = useQuery({
        enabled: Boolean(payBuzz && user.address && payBuzz.encryptContent),
        queryKey: ['buzzdecryptContent', buzzItem!.id],
        queryFn: () => getDecryptContent({
            address: user!.address,
            sign: '123',
            timestamp: Date.now(),
            pinId: buzzItem!.id,
            controlPath: '',
        }),
    })

    console.log('decryptContent', payBuzz, decryptContent)



    const handlePay = async () => {
        if (chain !== 'btc') {
            await connect('btc');
            message.info('switch to BTC network to pay')
            return
        }
        try {
            if (accessControl && accessControl.data) {
                const { data } = accessControl;
                const { payCheck } = data;

                await buildAccessPass(
                    data.pinId,
                    showConf?.host || '',
                    btcConnector!,
                    feeRate,
                    payCheck.payTo,
                    payCheck.amount,
                )
                message.success('Pay successfully, please wait for the transaction to be confirmed!')
            }
        } catch (e) {
            message.error(e.message)
        }



    }
    return <div className="tweet" style={{padding}} >
        <div className="avatar" style={{ cursor: 'pointer', position: 'relative' }} >
            <Avatar src={currentUserInfoData.data?.avatar ? <img width={40} height={40} src={BASE_MAN_URL + currentUserInfoData.data?.avatar}></img> : null} size={40} >
                {currentUserInfoData.data?.name ? currentUserInfoData.data?.name?.slice(0, 1) : currentUserInfoData.data?.metaid.slice(0, 1)}
            </Avatar>
            <FollowIconComponent metaid={currentUserInfoData.data?.metaid || ''} />

        </div>

        <div className="content" style={{
            cursor: 'pointer'
        }} >
            <div className="creater" onClick={(e) => {
                e.stopPropagation()
                history.push(`/profile/${buzzItem.creator}`)
            }}>
                <div className="name" style={{ fontSize: 14 }}>{currentUserInfoData.data?.name || 'Unname'}</div>
                <div className="metaid">{currentUserInfoData.data?.metaid.slice(0, 8)}</div>
            </div>
            <div className="text" style={{ margin: '8px 0', }} onClick={() => {
                history.push(`/tweet/${buzzItem.id}`)
            }}>
                {(summary ?? '').split('\n').map((line: string, index: number) => (
                    <span key={index} style={{ wordBreak: 'break-all' }}>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: handleSpecial(detectUrl(line)),
                            }}
                        />
                    </span>
                ))}
            </div>
            {
                payBuzz?.publicContent && <div className="text" style={{ margin: '8px 0', }} onClick={() => {
                    history.push(`/tweet/${buzzItem.id}`)
                }}>
                    {(payBuzz.publicContent ?? '').split('\n').map((line: string, index: number) => (
                        <span key={index} style={{ wordBreak: 'break-all' }}>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: handleSpecial(detectUrl(line)),
                                }}
                            />
                        </span>
                    ))}
                    {(decryptContent?.data ?? '').split('\n').map((line: string, index: number) => (
                        <span key={index} style={{ wordBreak: 'break-all' }}>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: handleSpecial(detectUrl(line)),
                                }}
                            />
                        </span>
                    ))
                    }

                    {
                        payBuzz.publicFiles && <div onClick={e => { e.stopPropagation() }} style={{ marginBottom: 24, marginTop: 12 }}>
                            <Image.PreviewGroup

                                preview={{
                                    onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
                                }}

                            >
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '4px',

                                }}
                                >
                                    {
                                        payBuzz.publicFiles.map((pid: string) => {
                                            return <Image
                                                key={pid}
                                                width={120}
                                                height={120}
                                                style={{ objectFit: 'cover' }}
                                                src={`${BASE_MAN_URL}/content/${pid.replace('metafile://', '')}`}
                                            />
                                        })
                                    }
                                    {
                                        payBuzz.encryptFiles
                                            .map((pid: string) => {
                                                return <div style={{ width: 120, height: 120, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
                                                    <LockOutlined style={{ fontSize: 24 }} />

                                                </div>
                                            }
                                            )

                                    }
                                </div>


                            </Image.PreviewGroup>
                        </div>
                    }
                    {
                        !decryptContent?.data && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: "rgba(32, 32, 32, 0.06)", borderRadius: 8, padding: '4px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Text type="warning" style={{ lineHeight: '16px' }}>{
                                    accessControl?.data?.payCheck?.amount
                                }</Text>
                                <img src={_btc} alt="" width={16} height={16} />
                            </div>
                            <Button shape='round' size='small' style={{ background: showConf?.gradientColor, color: '#fff' }} onClick={(e) => {
                                e.stopPropagation()
                                handlePay()
                            }
                            } >
                                Decrypt
                            </Button>
                        </div>
                    }

                </div>
            }




            {
                !isEmpty(attachPids) && <div onClick={e => { e.stopPropagation() }} style={{ marginBottom: 24 }}>
                    <Image.PreviewGroup

                        preview={{
                            onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
                        }}

                    >
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '4px',

                        }}
                        >
                            {
                                attachPids.map((pid: string) => {
                                    return <Image
                                        key={pid}
                                        width={120}
                                        height={120}
                                        style={{ objectFit: 'cover' }}
                                        src={`${BASE_MAN_URL}/content/${pid}`}
                                    />
                                })
                            }
                        </div>


                    </Image.PreviewGroup>
                </div>
            }


            {!isEmpty(quotePinId) && (

                <Card style={{ padding: 0, marginBottom: 12 }} styles={{ body: { padding: 12 } }} loading={isQuoteLoading}>
                    <ForwardTweet buzzItem={quoteDetailData!} showActions={false} />
                </Card>

            )}
            {<Space>
                <Tag bordered={false} color={buzzItem.chainName === 'mvc' ? 'blue' : 'orange'}>{buzzItem.chainName}</Tag>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>{dayjs
                    .unix(buzzItem.timestamp)
                    .format('YYYY-MM-DD HH:mm:ss')}</Typography.Text>

            </Space>}




            {showActions && <div className="actions">

                <Button type='text' icon={<MessageOutlined />} onClick={() => {
                    showComment ? setShowComment(false) : setShowComment(true)
                }}>
                    {buzzItem.commentCount}
                </Button>


                <Button type='text' onClick={handleLike} icon={isLikeByCurrentUser ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}>
                    {currentLikeData?.length}
                </Button>
                <div className="item">
                    <GiftOutlined />
                </div>
                <div className="item">
                    <Button type='text' icon={<UploadOutlined />} onClick={() => {
                        showNewPost ? setShowNewPost(false) : setShowNewPost(true)
                    }} />
                </div>
                {/* {
                    payBuzz && <div className="item">
                        <Button type='text' icon={<UnlockFilled />} onClick={handlePay} />
                    </div>
                } */}
            </div>}
        </div>


        <Comment tweetId={buzzItem.id} onClose={() => { setShowComment(false) }} show={showComment} />
        <NewPost show={showNewPost} onClose={() => { setShowNewPost(false) }} quotePin={buzzItem} />
    </div>
}