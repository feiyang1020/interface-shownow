import { curNetwork, FLAG } from '@/config';
import followEntitySchema from '@/entities/follow';
import { fetchFollowDetailPin } from '@/request/api';
import { CheckCircleFilled, LoadingOutlined, PlusCircleFilled } from '@ant-design/icons';
import { Button, message } from 'antd';
import { isNil } from 'ramda';
import React, { useMemo, useState } from 'react';
import { useModel } from 'umi';

type FollowProps = {
    metaid: string;
    isFollowing?: boolean;
    onFollowToggle?: () => void;
    loading?: boolean;
}
// Higher-order component to provide follow logic
const withFollow = (WrappedComponent: React.ComponentType<FollowProps>) => {
    return function FollowComponent(props: FollowProps) {
        const { metaid } = props;
        const { followList, chain, btcConnector, mvcConnector, user, feeRate, setFollowList } = useModel('user');
        const [loading, setLoading] = useState(false);
        const isFollowing = useMemo(() => {
            return followList.includes(metaid)
        }, [followList, metaid])

        const handelFollow = async () => {
            setLoading(true);
            try {

                if (chain === 'btc') {

                    const followRes = await btcConnector!.inscribe({
                        inscribeDataArray: [
                            {
                                operation: 'create',
                                path: '/follow',
                                body: metaid,
                                contentType: 'text/plain;utf-8',

                                flag: FLAG,
                            },
                        ],
                        options: {
                            noBroadcast: 'no',
                            feeRate: Number(feeRate),
                            // service: {
                            //     address: getServiceAddress(),
                            //     satoshis: environment.service_satoshi,
                            // },
                            // network: environment.network,
                        },
                    })
                    if (!isNil(followRes?.revealTxIds[0])) {
                        setFollowList((prev) => {
                            return [...prev, metaid]
                        })
                        message.success(
                            'Follow successfully! Please wait for the transaction to be confirmed!',
                        )
                    }
                } else {

                    const Follow = await mvcConnector!.load(followEntitySchema)

                    const res = await Follow.create({
                        data: { body: metaid },
                        options: {
                            network: curNetwork,
                            signMessage: 'Follow user',
                        },
                    })
                    console.log('create res for inscribe', res)

                    if (!isNil(res?.txid)) {
                        setFollowList((prev) => {
                            return [...prev, metaid]
                        })
                        message.success(
                            'Follow successfully! Please wait for the transaction to be confirmed!',
                        )
                    }
                }

            } catch (error) {
                console.log('error', error)
                const errorMessage = (error as any)?.message ?? error
                const toastMessage = errorMessage?.includes(
                    'Cannot read properties of undefined',
                )
                    ? 'User Canceled'
                    : errorMessage
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                message.error(toastMessage)
            }
            setLoading(false);
        }
        const handleUnfollow = async () => {
            setLoading(true);
            try {
                const followDetailData = await fetchFollowDetailPin({
                    metaId: metaid,
                    followerMetaId: user.metaid
                })
                if (chain === 'btc') {

                    const unfollowRes = await btcConnector!.inscribe({
                        inscribeDataArray: [
                            {
                                operation: 'revoke',
                                path: `@${followDetailData.followPinId}`,
                                contentType: 'text/plain;utf-8',
                                flag: FLAG,
                            },
                        ],
                        options: {
                            noBroadcast: 'no',
                            feeRate: Number(feeRate),
                            // service: {
                            //     address: getServiceAddress(),
                            //     satoshis: environment.service_satoshi,
                            // },
                            // network: environment.network,
                        },
                    })
                    if (!isNil(unfollowRes?.revealTxIds[0])) {

                        setFollowList((prev) => {
                            return prev.filter((i: string) => i !== metaid)
                        })
                        // await sleep(5000);
                        message.success(
                            'Unfollow successful! Please wait for the transaction to be confirmed.',
                        )
                    }
                } else {

                    const Follow = await mvcConnector!.load(followEntitySchema)

                    const res = await Follow.create({
                        data: {
                            // @ts-ignore
                            path: `@${followDetailData.followPinId}`,
                            contentType: 'text/plain;utf-8',
                            operation: 'revoke',
                        },
                        options: {
                            network: curNetwork,
                            signMessage: 'Unfollow user',
                        },
                    })

                    if (!isNil(res?.txid)) {
                        setFollowList((prev) => {
                            return prev.filter((i: string) => i !== metaid)
                        })
                        // await sleep(5000);
                        message.success(
                            'Unfollow successful! Please wait for the transaction to be confirmed.',
                        )
                    }
                }

            } catch (error: any) {
                console.log('error', error)
                const errorMessage = (error as any)?.message ?? error
                const toastMessage = errorMessage?.includes(
                    'Cannot read properties of undefined',
                )
                    ? 'User Canceled'
                    : errorMessage
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                message.error(toastMessage)

            }
            setLoading(false);
        }
        const handleFollowToggle = async () => {
            if (!isFollowing) {
                //unfollow
                await handelFollow();
            } else {
                //follow
                await handleUnfollow();
            }
        };

        // Pass the follow state and toggle function to the wrapped component

        return (<>
            {metaid === user?.metaid ? null : <WrappedComponent
                {...props}
                isFollowing={isFollowing}
                onFollowToggle={handleFollowToggle}
                loading={loading}
            />}

        </>
        );
    };
};





const FollowIcon: React.FC<FollowProps> = ({ isFollowing, onFollowToggle, loading }) => {
    const { showConf } = useModel('dashboard');
    return (
        <div
            onClick={(e) => { e.preventDefault(); onFollowToggle && onFollowToggle(); }}
            style={{ position: 'absolute', bottom: 0, right: 0, background: '#fff', borderRadius: '50%', border: '1px solid #fff', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {
                loading ? <LoadingOutlined style={{ color: showConf?.brandColor }} size={16} /> : <>
                    {
                        isFollowing
                            ? <CheckCircleFilled size={16} style={{ color: showConf?.brandColor }} />
                            : <PlusCircleFilled size={16} style={{ color: showConf?.brandColor }} />
                    }
                </>

            }
        </div>

    );
};

const FollowButtonIcon: React.FC<FollowProps> = ({ isFollowing, onFollowToggle, loading }) => {
    const { showConf } = useModel('dashboard');
    return (
        <Button
            onClick={(e) => { e.preventDefault(); onFollowToggle && onFollowToggle(); }}
            style={{ color: '#fff', background: showConf?.gradientColor }}
            loading={loading}
            shape='round'


        >
            {


                isFollowing
                    ? 'Following'
                    : 'Follow'


            }
        </Button>

    );
};

const FollowIconComponent = withFollow(FollowIcon);
const FollowButtonComponent = withFollow(FollowButtonIcon);

export { FollowIconComponent, FollowButtonComponent };
