import { BASE_MAN_URL, curNetwork } from "@/config";
import { fetchFollowDetailPin, fetchFollowingList, getUserInfo } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Card, Divider, Space } from "antd"
import { F, isEmpty } from "ramda";
import { useModel, history } from "umi";
import defaultImg from '@/assets/img 2@1x.png'
import { Divide } from "lucide-react";
import { FollowButtonComponent } from "../Follow";
import UserAvatar from "../UserAvatar";
import { EditOutlined } from "@ant-design/icons";

type Props = {
    address: string
}
export default ({ address }: Props) => {
    const { btcConnector, user } = useModel('user');
    const { showConf } = useModel('dashboard')

    const profileUserData = useQuery({
        queryKey: ['userInfo', address],
        queryFn: () => getUserInfo({ address }),
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
                style={{ height: 240, objectFit: 'cover', background: showConf?.gradientColor, borderRadius: 10 }}
            // alt="example"
            // src={defaultImg}
            >
                {
                    profileUserData?.data?.background &&
                    <img src={`${BASE_MAN_URL}` + profileUserData?.data?.background} alt="example" style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 10 }} />
                }

            </div>
        }>
            <div style={{ padding: 20 }}>

                <div className="avatar" style={{ marginTop: -60 }}>
                    <UserAvatar src={profileUserData?.data?.avatar} size={80} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>


                    <div style={{ marginTop: 10 }}>
                        <h3>{profileUserData?.data?.name}</h3>
                        <p>MetaID: {profileUserData?.data?.metaid.slice(0, 8)}</p>
                    </div>


                    <FollowButtonComponent metaid={profileUserData?.data?.metaid || ''} />
                    {
                        address === user.address && <Button icon={<EditOutlined />} variant='filled' color='default' shape='circle'  onClick={() => {
                            history.push('/setting')
                        }
                        } />
                    }


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