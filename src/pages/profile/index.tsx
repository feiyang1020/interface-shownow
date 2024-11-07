import { fetchBuzzs, getIndexTweet } from "@/request/api";
import { useCallback, useEffect, useMemo, useState } from "react"
import './index.less'
import { Grid, Carousel, Col, Divider, List, Row, Skeleton } from "antd";
import defaultImg from '@/assets/img 2@1x.png'
import { GiftOutlined, HeartOutlined, MessageOutlined, UploadOutlined } from "@ant-design/icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useModel, useMatch } from "umi";
import { curNetwork } from "@/config";
import Buzz from "@/Components/Buzz";
import InfiniteScroll from 'react-infinite-scroll-component';
import { IBtcConnector } from "@metaid/metaid";
import { isNil } from "ramda";
import ProfileCard from "@/Components/ProfileCard";
import Recommend from "@/Components/Recommend";
const { useBreakpoint } = Grid

export default () => {
    const { md } = useBreakpoint()
    const match = useMatch('/profile/:address');

    const { btcConnector, user } = useModel('user');

    const address = useMemo(() => {
        if (!match || !match.params.address) {
            return user?.address;
        } else {
            return match.params.address;
        }
    }, [match, user])

    const isMy = useMemo(() => {
        return user?.address === address;
    }, [address, user])

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState<null | number>(null);
    const getTotal = async (btcConnector: IBtcConnector) => {
        setTotal(
            await btcConnector?.totalPin({
                network: curNetwork,
                path: ['/protocols/simplebuzz', '/protocols/banana'],

            })
        );
    };

    useEffect(() => {
        if (!isNil(btcConnector)) {
            getTotal(btcConnector!);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [btcConnector]);


    const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
        useInfiniteQuery({
            queryKey: ['buzzes', address],
            enabled: Boolean(btcConnector && address),
            queryFn: ({ pageParam }) =>
                fetchBuzzs({
                    page: pageParam,
                    limit: 5,
                    btcConnector: btcConnector!,
                    network: curNetwork,
                    path: ['/protocols/simplebuzz', '/protocols/banana'],
                    address: address
                }),
            initialPageParam: 1,
            getNextPageParam: (lastPage, allPages) => {
                const nextPage = lastPage?.length ? allPages.length + 1 : undefined;
                if (!lastPage || lastPage?.length < 5) {
                    return undefined
                }
                if (allPages.length * 5 >= (total ?? 0)) {
                    return;
                }
                return nextPage;
            },
        });

    const tweets = useMemo(() => {
        return data ? data?.pages.reduce((acc, item) => {

            return [...acc || [], ...item || []]
        }, []) : []
    }, [data])
    return <div className="profilePage">
        <Row gutter={[12, 12]}>
            <Col span={24} md={15}>
                <div className="tweets">
                    <div
                        id="scrollableDiv"
                        style={{
                            height: `calc(100vh - ${md ? 80 : 130}px)`,
                            overflow: 'auto',
                        }}
                    >
                        <div style={{paddingBottom:12}}>
                            <ProfileCard address={address} />
                        </div>

                        <InfiniteScroll
                            dataLength={tweets.length}
                            next={fetchNextPage}
                            hasMore={hasNextPage}
                            loader={<Skeleton avatar paragraph={{ rows: 2 }} active />}
                            endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                            scrollableTarget="scrollableDiv"
                        >
                            <List
                                dataSource={tweets}
                                renderItem={(item: API.Pin) => (
                                    <List.Item key={item.id}>
                                        <Buzz buzzItem={item} />
                                    </List.Item>
                                )}
                            />
                        </InfiniteScroll>
                    </div>

                </div>
            </Col>
            {
                md && <Col md={9} span={24}>
                    <Recommend />
                </Col>
            }
        </Row>


    </div>
}