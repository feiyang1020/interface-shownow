import { BASE_MAN_URL, curNetwork } from "@/config";
import { fetchFollowDetailPin, fetchFollowingList } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Divider, Space } from "antd"
import { F, isEmpty } from "ramda";
import { useModel } from "umi";
import defaultImg from '@/assets/img 2@1x.png'
import { Divide } from "lucide-react";
import { FollowButtonComponent } from "../Follow";

type Props = {
    address: string
}
export default ({ address }: Props) => {
    const { btcConnector, user } = useModel('user');
    const { showConf } = useModel('dashboard')

    const profileUserData = useQuery({
        queryKey: ['userInfo', address],
        queryFn: () =>
            btcConnector?.getUser({
                network: curNetwork,
                currentAddress: address,
            }),
    });
    const { data: myFollowingListData } = useQuery({
        queryKey: ['myFollowing', btcConnector?.metaid],
        enabled: !isEmpty(btcConnector?.metaid ?? ''),
        queryFn: () =>
            fetchFollowingList({
                metaid: btcConnector?.metaid ?? '',
                params: { cursor: '0', size: '100', followDetail: false },
            }),
    });
    const { data: followDetailData } = useQuery({
        queryKey: [
            'followDetail',
            btcConnector?.metaid,
            profileUserData?.data?.metaid,
        ],
        enabled:
            !isEmpty(btcConnector?.metaid ?? '') &&
            !isEmpty(profileUserData?.data?.metaid),
        queryFn: () =>
            fetchFollowDetailPin({
                metaId: profileUserData?.data?.metaid ?? '',
                followerMetaId: btcConnector?.metaid ?? '',
            }),
    });

    const { data: followingListData } = useQuery({
        queryKey: ['following', profileUserData?.data?.metaid],
        enabled: !isEmpty(profileUserData?.data?.metaid ?? ''),
        queryFn: () =>
            fetchFollowingList({
                metaid: profileUserData?.data?.metaid ?? '',
                params: { cursor: '0', size: '100', followDetail: false },
            }),
    });
    return (
        <Card style={{ padding: 0 }} styles={{ body: { padding: 0 } }} bordered={false} cover={
            <div
                style={{ height: 240, objectFit: 'cover', background: showConf?.gradientColor }}
                // alt="example"
                // src={defaultImg}
            />
        }>
            <div style={{ padding: 20 }}>

                <div className="avatar" style={{ marginTop: -60 }}>
                    <Avatar size={80} src={`${BASE_MAN_URL}` + profileUserData?.data?.avatar} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>


                    <div style={{ marginTop: 10 }}>
                        <h3>{profileUserData?.data?.name}</h3>
                        <p>MetaID: {profileUserData?.data?.metaid.slice(0, 8)}</p>
                    </div>


                    <FollowButtonComponent metaid={profileUserData?.data?.metaid || ''} />
                </div>

                <Space >
                    <Space>
                        <span>{followDetailData?.total || 0}</span>
                        <span>Followers</span>
                    </Space>
                    <Divider type='vertical' />
                    <Space>
                        <span>{followingListData?.total || 0}</span>
                        <span>Following</span>
                    </Space>
                </Space>

            </div>

        </Card>
    )
}