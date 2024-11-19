import { BASE_MAN_URL, curNetwork, FLAG } from "@/config";
import { fetchCurrentBuzzLikes, getControlByContentPin, getPinDetailByPid, getUserInfo } from "@/request/api";
import { GiftOutlined, HeartFilled, HeartOutlined, LockOutlined, MessageOutlined, SyncOutlined } from "@ant-design/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Card, Divider, Image, message, Space, Tag, Typography } from "antd";
import { isEmpty, isNil } from "ramda";
import { useModel, history } from "umi";
import './index.less'
import dayjs from "dayjs";
import { buildAccessPass, decodePayBuzz } from "@/utils/buzz";
import { FollowIconComponent } from "../Follow";
import { detectUrl, handleSpecial } from "@/utils/utils";
import _btc from '@/assets/btc.png'
import { useState } from "react";
import Unlock from "../Unlock";
const { Text } = Typography;

type Props = {
    buzzItem: API.Pin
    showActions?: boolean
}

export default ({ buzzItem, showActions = true }: Props) => {
    const { showConf, manPubKey } = useModel('dashboard');
    const [showUnlock, setShowUnlock] = useState(false);
    const [paying, setPaying] = useState(false);
    const queryClient = useQueryClient();
    const { btcConnector, user, chain, connect, feeRate } = useModel('user')
    const currentUserInfoData = useQuery({
        queryKey: ['userInfo', buzzItem!.address],
        queryFn: () => getUserInfo({ address: buzzItem!.address }),
    });













    const { data: accessControl } = useQuery({
        enabled: !isEmpty(buzzItem),
        queryKey: ['buzzAccessControl', buzzItem!.id],
        queryFn: () => getControlByContentPin({ pinId: buzzItem!.id }),
    })

    const { data: decryptContent, refetch: refetchDecrypt } = useQuery({
        enabled: Boolean(user.address),
        queryKey: ['buzzdecryptContent', buzzItem!.id, chain, user.address],
        queryFn: () => decodePayBuzz(buzzItem, manPubKey!, chain),
    })




    const handlePay = async () => {
        setPaying(true);
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
                refetchDecrypt()
            }
        } catch (e) {
            message.error(e.message)
        }
        setPaying(false);
    }




    return <div className="tweet" style={{ padding: 0 }} onClick={e => {
        e.stopPropagation()
    }}>
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
            <div onClick={() => {
                history.push(`/tweet/${buzzItem.id}`)
            }}>


                <div className="text" style={{ margin: '8px 0', }} >
                    {(decryptContent?.publicContent ?? '').split('\n').map((line: string, index: number) => (
                        <span key={index} style={{ wordBreak: 'break-all' }}>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: handleSpecial(detectUrl(line)),
                                }}
                            />
                        </span>
                    ))}
                    {
                        decryptContent?.buzzType === 'pay' && decryptContent.status === 'purchased' && decryptContent.encryptContent && <>

                            {(decryptContent?.encryptContent ?? '').split('\n').map((line: string, index: number) => (
                                <span key={index} style={{ wordBreak: 'break-all' }}>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: handleSpecial(detectUrl(line)),
                                        }}
                                    />
                                </span>
                            ))}
                        </>
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
                                            />
                                        }) :
                                            decryptContent?.encryptFiles
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
                    </>
                }
                {
                    buzzItem.genesisHeight !== 0 && decryptContent?.buzzType === 'pay' && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, background: "rgba(32, 32, 32, 0.06)", borderRadius: 8, padding: '4px 12px' }}>
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



                {<Space>
                    <Tag bordered={false} icon={buzzItem.genesisHeight === 0 ? <SyncOutlined spin /> : null} color={buzzItem.chainName === 'mvc' ? 'blue' : 'orange'}>{buzzItem.chainName}</Tag>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{dayjs
                        .unix(buzzItem.timestamp)
                        .format('YYYY-MM-DD HH:mm:ss')}</Typography.Text>

                </Space>}

            </div>

        </div>

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

    </div>
}