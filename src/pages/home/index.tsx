import { fetchAllBuzzs, fetchBuzzs, getIndexTweet } from "@/request/api";
import { useCallback, useEffect, useMemo, useState } from "react"
import './index.less'
import { Carousel, Col, Divider, List, Row, Skeleton, Grid } from "antd";
import defaultImg from '@/assets/img 2@1x.png'
import { GiftOutlined, HeartOutlined, MessageOutlined, UploadOutlined } from "@ant-design/icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useModel } from "umi";
import { curNetwork } from "@/config";
import Buzz from "@/Components/Buzz";
import InfiniteScroll from 'react-infinite-scroll-component';
import { IBtcConnector } from "@metaid/metaid";
import { isNil } from "ramda";
import Recommend from "@/Components/Recommend";
const { useBreakpoint } = Grid


export default () => {
    const { md } = useBreakpoint()
    const { btcConnector, user } = useModel('user')
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
            queryKey: ['homebuzzesnew', user.address],
            enabled: Boolean(btcConnector),
            queryFn: ({ pageParam }) =>
                fetchAllBuzzs({
                    size: 5,
                    lastId: pageParam,
                }),
            initialPageParam: '',
            getNextPageParam: (lastPage, allPages) => {
                const { data: { lastId } } = lastPage
                if (!lastId) return
                return lastId;
            },
        });

    const tweets = useMemo(() => {
        return data ? data?.pages.reduce((acc, item) => {
            return [...acc || [], ...item.data.list || []]
        }, []) : []
    }, [data])
    return <div className="homePage">
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
                        {isLoading && <Skeleton avatar paragraph={{ rows: 2 }} active />}
                        <InfiniteScroll
                            dataLength={tweets.length}
                            next={fetchNextPage}
                            hasMore={hasNextPage}
                            loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
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