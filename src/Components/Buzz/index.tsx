import { BASE_MAN_URL, curNetwork, FLAG } from "@/config";
import { fetchCurrentBuzzLikes } from "@/request/api";
import { GiftOutlined, HeartFilled, HeartOutlined, MessageOutlined, UploadOutlined } from "@ant-design/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Divider, Image, message, Space, Typography } from "antd";
import { isEmpty, isNil } from "ramda";
import { useMemo } from "react";
import { useModel, history } from "umi";
const { Paragraph, Text } = Typography;

type Props = {
    buzzItem: API.Pin
}

export default ({ buzzItem }: Props) => {
    const queryClient = useQueryClient();
    const { btcConnector, user, isLogin, connect } = useModel('user')
    const currentUserInfoData = useQuery({
        queryKey: ['userInfo', buzzItem!.address],
        queryFn: () =>
            btcConnector?.getUser({
                network: curNetwork,
                currentAddress: buzzItem!.address,
            }),
    });
    const summary = useMemo(() => {
        let _summary = buzzItem!.contentSummary;
        const isSummaryJson = _summary.startsWith('{') && _summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
        return isSummaryJson ? parseSummary.content : _summary;
    }, [buzzItem])
    const attachPids = useMemo(() => {
        const isFromBtc = buzzItem?.chainName === 'btc';
        let _summary = buzzItem!.contentSummary;
        const isSummaryJson = _summary.startsWith('{') && _summary.endsWith('}');
        const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
        return isSummaryJson && !isEmpty(parseSummary?.attachments ?? []) && isFromBtc
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
        (d) => d?.pinAddress === btcConnector?.address
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

        const likeEntity = await btcConnector!.use('like');
        try {
            const likeRes = await likeEntity.create({
                dataArray: [
                    {
                        body: JSON.stringify({ isLike: '1', likeTo: pinId }),
                        flag: FLAG,
                        contentType: 'text/plain;utf-8',
                    },
                ],
                options: {
                    noBroadcast: 'no',
                    //   feeRate: Number(globalFeeRate),
                    //   service: {
                    //     address: environment.service_address,
                    //     satoshis: environment.service_staoshi,
                    //   },
                    // network: environment.network,
                },
            });
            console.log('likeRes', likeRes);
            if (!isNil(likeRes?.revealTxIds[0])) {
                queryClient.invalidateQueries({ queryKey: ['buzzes'] });
                queryClient.invalidateQueries({ queryKey: ['payLike', buzzItem!.id] });
                // await sleep(5000);
                message.success('like buzz successfully');
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

    return <div className="tweet" >
        <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => {
            history.push(`/profile/${buzzItem.creator}`)
        }}>
            <Avatar src={BASE_MAN_URL + currentUserInfoData.data?.avatar} size={40} />
            <div className="creater">
                <div className="name" style={{ fontSize: 14 }}>{currentUserInfoData.data?.name}</div>
                <div className="metaid">{currentUserInfoData.data?.metaid.slice(0, 8)}</div>
            </div>
        </div>

        <div className="content" style={{
            marginTop: 24,
            paddingLeft: 61
        }}>
            <div className="text">
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

            <Image.PreviewGroup
                preview={{
                    onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
                }}

            >
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '10px',
                    marginTop: 24
                }}>
                    {
                        attachPids.map((pid: string) => {
                            return <Image

                                key={pid}
                                width={200}
                                src={`${BASE_MAN_URL}/content/${pid}`}
                            />
                        })
                    }
                </div>


            </Image.PreviewGroup>
        </div>
        <div className="actions">
            <div className="item">
                <MessageOutlined />
            </div>
            <Space className="item" onClick={handleLike} style={{}}>
                {isLikeByCurrentUser ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
                {currentLikeData?.length}
            </Space>
            <div className="item">
                <GiftOutlined />
            </div>
            <div className="item">
                <UploadOutlined />
            </div>
        </div>
    </div>
}