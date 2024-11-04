import { fetchBuzzs, getIndexTweet } from "@/request/api";
import { useCallback, useEffect, useMemo, useState } from "react"
import './index.less'
import { Card, Carousel, Divider, List, Skeleton } from "antd";
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

export default () => {
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
        <div className="tweets">
            
            <div
                id="scrollableDiv"
                style={{
                    height: 'calc(100vh - 80px)',
                    overflow: 'auto',
                }}
            >
                <ProfileCard address={address} />
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
        <div className="recommand">
            <Carousel className="carousel" autoplay>
                <div className="carouselItem">
                    <img src={defaultImg} alt="" />
                </div>
                <div className="carouselItem">
                    <img src={defaultImg} alt="" />
                </div>
                <div className="carouselItem">
                    <img src={defaultImg} alt="" />
                </div>
                <div className="carouselItem">
                    <img src={defaultImg} alt="" />
                </div>
            </Carousel>
            <h3>Recommend </h3>

            <Carousel className="carousel2" autoplay>
                <div className="carouselItem">
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                </div>
                <div className="carouselItem">
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />

                </div>
                <div className="carouselItem">
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                </div>
                <div className="carouselItem">
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                    <img src={defaultImg} alt="" />
                </div>
            </Carousel>
        </div>
    </div>
}