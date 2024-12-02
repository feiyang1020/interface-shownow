import { BASE_MAN_URL, curNetwork, FallbackImage, FLAG } from "@/config";
import { fetchBuzzDetail, fetchCurrentBuzzComments, fetchCurrentBuzzLikes, getControlByContentPin, getDecryptContent, getIDCoinInfo, getMRC20Info, getPinDetailByPid, getUserInfo } from "@/request/api";
import { CheckCircleOutlined, DownOutlined, GiftOutlined, HeartFilled, HeartOutlined, LinkOutlined, LockOutlined, MessageOutlined, PlusCircleFilled, SyncOutlined, UnlockFilled, UploadOutlined } from "@ant-design/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Divider, Image, message, Space, Spin, Tag, Typography } from "antd";
import { is, isEmpty, isNil } from "ramda";
import { useEffect, useMemo, useRef, useState } from "react";
import { useModel, history } from "umi";
import Comment from "../Comment";
import NewPost from "../NewPost";
import './index.less'
import ForwardTweet from "./ForwardTweet";
import { IMvcEntity } from "@metaid/metaid";
import { FollowIconComponent } from "../Follow";
import dayjs from "dayjs";
import { buildAccessPass, decodePayBuzz } from "@/utils/buzz";
const { Paragraph, Text } = Typography;
import _btc from '@/assets/btc.png'
import Unlock from "../Unlock";
import { detectUrl, handleSpecial, openWindowTarget, sleep } from "@/utils/utils";
import UserAvatar from "../UserAvatar";

type Props = {
    buzzItem: API.Buzz
    like?: API.LikeRes[]
    showActions?: boolean,
    padding?: number
    reLoading?: boolean
    refetch?: () => Promise<any>
    isForward?: boolean,
    loading?: boolean
}

export default ({ buzzItem, showActions = true, padding = 20, reLoading = false, refetch, isForward = false, loading, like = [] }: Props) => {
    const [showComment, setShowComment] = useState(false);
    const [showNewPost, setShowNewPost] = useState(false);
    const [showUnlock, setShowUnlock] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null); // 引用内容容器
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false); // 是否溢出
    const [paying, setPaying] = useState(false);
    const queryClient = useQueryClient();
    const { btcConnector, user, isLogin, connect, feeRate, chain, mvcConnector } = useModel('user');
    const { showConf, fetchServiceFee, manPubKey } = useModel('dashboard');
    const [handleLikeLoading, setHandleLikeLoading] = useState(false);
    const currentUserInfoData = useQuery({
        queryKey: ['userInfo', buzzItem!.address],
        enabled: !isNil(buzzItem?.address),
        queryFn: () => {
            return getUserInfo({ address: buzzItem!.address })
        },
    });

    const payBuzz = useMemo(() => {
        let _summary = buzzItem!.content;
        const isSummaryJson = _summary.startsWith('{') && _summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
        return isSummaryJson ? parseSummary : undefined;
    }, [buzzItem])



    const isLiked = useMemo(() => {
        if (!buzzItem || !user) return false
        const likes = buzzItem.like ?? [];
        const _like = like ?? [];
        return likes.includes(user.metaid) || _like.some((item) => item.CreateMetaid === user.metaid)
    }, [buzzItem, user, like])
    const handleLike = async () => {
        const pinId = buzzItem!.id;
        if (!isLogin) {
            await connect()
            return
        }
        if (isLiked) {
            message.error('You have already liked that buzz...');
            return;
        }
        setHandleLikeLoading(true)
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
                    await sleep(5000);
                    queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] });
                    queryClient.invalidateQueries({ queryKey: ['payLike', buzzItem!.id] });



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
                    await sleep(8000);
                    refetch && refetch()
                    queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] })
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
        setHandleLikeLoading(false)
    };
    const quotePinId = useMemo(() => {
        if (isForward) return ''
        let _summary = buzzItem!.content;
        const isSummaryJson = _summary.startsWith('{') && _summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
        return isSummaryJson && !isEmpty(parseSummary?.quotePin ?? '')
            ? parseSummary.quotePin
            : '';
    }, [buzzItem, isForward])



    const { isLoading: isQuoteLoading, data: quoteDetailData, } = useQuery({
        enabled: !isEmpty(quotePinId),
        queryKey: ['buzzDetail', quotePinId,],
        queryFn: () => fetchBuzzDetail({ pinId: quotePinId }),
    })

    const { data: accessControl } = useQuery({
        enabled: !isEmpty(payBuzz),
        queryKey: ['buzzAccessControl', buzzItem!.id],
        queryFn: () => getControlByContentPin({ pinId: buzzItem!.id }),
    })



    const { data: decryptContent, refetch: refetchDecrypt } = useQuery({
        enabled: Boolean(user.address),
        queryKey: ['buzzdecryptContent', buzzItem!.id, chain, user.address],
        queryFn: () => decodePayBuzz(buzzItem, manPubKey!, chain),
    })

    const handlePay = async () => {
        setPaying(true)
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
                setShowUnlock(false);
                setTimeout(() => {
                    refetchDecrypt()
                }, 1000)

            }
        } catch (e) {
            message.error(e.message)
        }
        setPaying(false)
    }

    const { data: mrc20 } = useQuery({
        enabled: Boolean(accessControl?.data?.holdCheck),
        queryKey: ['mrc20', accessControl],
        queryFn: async () => {
            const { data } = await getMRC20Info({ tick: accessControl!.data.holdCheck.ticker })
            if (data.mrc20Id) {
                const userInfo = await getUserInfo({ address: data.address });
                return {
                    ...data,
                    deployerUserInfo: userInfo
                }
            }
            return Promise.resolve(null)
        }
    })

    useEffect(() => {
        // 检测内容是否溢出
        if (contentRef.current) {
            const { scrollHeight, offsetHeight } = contentRef.current;
            setIsOverflowing(scrollHeight > offsetHeight);
        }
    }, [contentRef.current]); // 当内容变化时重新检测


    return <Card className="tweet"
        loading={loading}
        style={{ width: '100%' }}
        styles={{ header: { height: 40 } }}
        title={
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ cursor: 'pointer', position: 'relative' }} >
                    <UserAvatar src={currentUserInfoData.data?.avatar} size={40} />
                    <FollowIconComponent metaid={currentUserInfoData.data?.metaid || ''} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onClick={(e) => {
                    e.stopPropagation()
                    history.push(`/profile/${buzzItem.creator}`)
                }}>
                    <Text style={{ fontSize: 14, lineHeight: 1 }}> {currentUserInfoData.data?.name || 'Unnamed'}</Text>
                    <Text type="secondary" style={{ fontSize: 10, lineHeight: 1 }}>{currentUserInfoData.data?.metaid.slice(0, 8)}</Text>
                </div>
            </div>
        }
    >


        <div className="content" style={{
            cursor: 'pointer'
        }} >

            <div onClick={() => {
                history.push(`/tweet/${buzzItem.id}`)
            }}>
                <div className="text" ref={contentRef} style={{
                    position: 'relative',
                    maxHeight: isExpanded ? 'none' : 200,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                }}  >
                    {(decryptContent?.publicContent ?? '').split('\n').map((line: string, index: number) => (
                        <span key={index} style={{ wordBreak: 'break-all', }}>
                            <div
                                style={{ minHeight: 22 }}
                                dangerouslySetInnerHTML={{
                                    __html: handleSpecial(detectUrl(line)),
                                }}
                            />
                        </span>
                    ))}
                    {
                        decryptContent?.buzzType === 'pay' && decryptContent.status === 'purchased' && decryptContent.encryptContent && <>

                            {(decryptContent?.encryptContent ?? '').split('\n').map((line: string, index: number) => (
                                <span key={'pay' + index} style={{ wordBreak: 'break-all' }}>
                                    <div
                                        style={{ minHeight: 22 }}
                                        dangerouslySetInnerHTML={{
                                            __html: handleSpecial(detectUrl(line)),
                                        }}
                                    />
                                </span>
                            ))}
                        </>
                    }
                    {
                        isOverflowing && !isExpanded && (
                            <div style={{
                                width: '100%',
                                paddingTop: 78,
                                backgroundImage: 'linear-gradient(-180deg,rgba(255,255,255,0) 0%,#fff 100%)',
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Button variant="filled" color="primary" size='small' onClick={(e) => { e.stopPropagation(); setIsExpanded(true) }} icon={<DownOutlined />} />
                            </div>
                        )
                    }


                </div>




                {
                    decryptContent?.publicFiles && <>

                        <div onClick={e => { e.stopPropagation() }} style={{ marginBottom: 12, marginTop: 12 }}>
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
                                        decryptContent?.publicFiles.map((pid: string) => {
                                            return <Image
                                                key={pid}
                                                width={120}
                                                height={120}
                                                style={{ objectFit: 'cover' }}
                                                src={`${BASE_MAN_URL}/content/${pid.replace('metafile://', '')}`}
                                                fallback={FallbackImage}
                                            />
                                        })
                                    }
                                    {
                                        decryptContent.status === 'purchased' ? decryptContent?.encryptFiles.map((pid: string) => {
                                            return <Image
                                                key={pid}
                                                width={120}
                                                height={120}
                                                style={{ objectFit: 'cover' }}
                                                src={`data:image/jpeg;base64,${pid}`}
                                                fallback={FallbackImage}
                                            />
                                        }) :
                                            decryptContent?.encryptFiles
                                                .map((pid: string) => {
                                                    return <div key={pid} style={{ width: 120, height: 120, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
                                                        <LockOutlined style={{ fontSize: 24 }} />

                                                    </div>
                                                }
                                                )
                                    }

                                </div>


                            </Image.PreviewGroup>
                        </div>
                    </>
                }
                {
                    decryptContent?.buzzType === 'pay' && <Spin spinning={accessControl?.data.mempool === 1}>{
                        accessControl?.data?.payCheck && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, background: "rgba(32, 32, 32, 0.06)", borderRadius: 8, padding: '4px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Text type="warning" style={{ lineHeight: '16px' }}>{
                                    accessControl?.data?.payCheck?.amount
                                }</Text>
                                <img src={_btc} alt="" width={16} height={16} />
                            </div>
                            <Button shape='round' size='small' style={{ background: decryptContent.status === 'unpurchased' ? showConf?.gradientColor : '', color: decryptContent.status === 'unpurchased' ? '#fff' : '' }}
                                disabled={decryptContent?.status === 'purchased' || decryptContent?.status === 'mempool'} onClick={async (e) => {
                                    e.stopPropagation()
                                    setShowUnlock(true)
                                }}
                                loading={decryptContent?.status === 'mempool'}
                            >
                                {decryptContent.status === 'unpurchased' ? 'Unlock' : 'Unlocked'}
                            </Button>
                        </div>
                    }
                        {
                            accessControl?.data?.holdCheck && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, background: "rgba(32, 32, 32, 0.06)", borderRadius: 8, padding: '4px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Text type="warning" style={{ lineHeight: '16px' }}>
                                        {
                                            `Hold ${accessControl?.data?.holdCheck?.amount} ${accessControl?.data?.holdCheck?.ticker}`
                                        }
                                    </Text>
                                    {
                                        mrc20 && <UserAvatar src={mrc20.deployerUserInfo.avatar} size={20} />
                                    }
                                </div>
                                <Button shape='round' size='small' style={{ background: decryptContent.status === 'unpurchased' ? showConf?.gradientColor : '', color: decryptContent.status === 'unpurchased' ? '#fff' : '' }}
                                    disabled={decryptContent?.status === 'purchased' || decryptContent?.status === 'mempool'} onClick={async (e) => {
                                        window.open(`https://${curNetwork === 'testnet' ? 'testnet' : 'www'}.metaid.market/idCoin/${accessControl?.data?.holdCheck?.ticker}`, openWindowTarget())
                                    }}
                                    loading={decryptContent?.status === 'mempool'}
                                >
                                    Mint
                                </Button>
                            </div>
                        }

                    </Spin>
                }


                {(!isEmpty(quotePinId)) && (

                    <Card onClick={(e) => {
                        e.stopPropagation()

                    }} style={{ padding: 0, marginBottom: 12, boxShadow: 'none' }} bordered={false} styles={{ body: { padding: 0 } }} loading={isQuoteLoading}>
                        {quoteDetailData?.data && <ForwardTweet buzzItem={quoteDetailData?.data.tweet} showActions={false} />}
                    </Card>

                )}
                <Space>
                    <Button
                        size='small'
                        type="link"
                        icon={
                            <LinkOutlined />
                        }
                        style={{
                            fontSize: 12
                        }}
                        onClick={(e) => {
                            e.stopPropagation();

                            const link = buzzItem.chainName === 'btc' ? `${curNetwork === "testnet"
                                ? "https://mempool.space/testnet/tx/"
                                : "https://mempool.space/tx/"
                                }${buzzItem.genesisTransaction}`
                                : `https://${curNetwork === "testnet" ? "test" : "www"
                                }.mvcscan.com/tx/${buzzItem.genesisTransaction}`
                            window.open(link, '_blank')
                        }}
                    >
                        {buzzItem.genesisTransaction.slice(0, 8)}
                    </Button>
                    <Tag icon={buzzItem.genesisHeight === 0 ? <SyncOutlined spin /> : null} bordered={false} color={buzzItem.chainName === 'mvc' ? 'blue' : 'orange'}>{buzzItem.chainName}</Tag>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{dayjs
                        .unix(buzzItem.timestamp)
                        .format('YYYY-MM-DD HH:mm:ss')}</Typography.Text>

                </Space>

            </div>




            {showActions && <div className="actions">

                <Button type='text' icon={<MessageOutlined />} onClick={() => {
                    showComment ? setShowComment(false) : setShowComment(true)
                }}>
                    {buzzItem.commentCount}
                </Button>


                <Button type='text' loading={handleLikeLoading} onClick={handleLike} icon={isLiked ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}>
                    {buzzItem?.likeCount}
                </Button>
                <div className="item">
                    <GiftOutlined />
                </div>
                <div className="item">
                    <Button type='text' icon={<UploadOutlined />} onClick={() => {
                        showNewPost ? setShowNewPost(false) : setShowNewPost(true)
                    }} />
                </div>
            </div>}
        </div>


        <Comment tweetId={buzzItem.id} onClose={() => {
            setShowComment(false)
        }} show={showComment} refetch={refetch} />
        <NewPost show={showNewPost} onClose={() => { setShowNewPost(false) }} quotePin={buzzItem} />
        <Unlock show={showUnlock && (decryptContent?.status !== 'purchased' && decryptContent?.status !== 'mempool')} onClose={() => { setShowUnlock(false) }}  >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                flexDirection: 'column'
            }}>
                <img src={_btc} alt="" width={60} height={60} />
                {accessControl?.data?.payCheck?.amount} BTC
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 20,

                }}>
                    <Button shape='round' type='primary' block onClick={() => {
                        setShowUnlock(false)
                    }} >
                        Cancel
                    </Button>
                    <Button shape='round' block loading={paying} style={{ background: showConf?.gradientColor, color: '#fff' }}
                        onClick={async (e) => {
                            e.stopPropagation()
                            handlePay()
                        }
                        } >
                        Unlock
                    </Button>

                </div>
            </div>
        </Unlock>
    </Card>
}