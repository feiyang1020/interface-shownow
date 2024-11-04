import { fetchBuzzs, fetchFollowingList, fetchMyFollowingBuzzs, fetchMyFollowingTotal, getIndexTweet } from "@/request/api";
import { useCallback, useEffect, useMemo, useState } from "react"
import './index.less'
import { Carousel, Divider, List, Skeleton } from "antd";
import defaultImg from '@/assets/img 2@1x.png'
import { GiftOutlined, HeartOutlined, MessageOutlined, UploadOutlined } from "@ant-design/icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useModel } from "umi";
import { curNetwork } from "@/config";
import Buzz from "@/Components/Buzz";
import InfiniteScroll from 'react-infinite-scroll-component';
import { IBtcConnector } from "@metaid/metaid";
import { isEmpty, isNil } from "ramda";

export default () => {
    const { btcConnector, user } = useModel('user')
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState<null | number>(null);

    const { data: myFollowingListData } = useQuery({
        queryKey: ['myFollowing', btcConnector?.metaid],
        enabled: !isEmpty(btcConnector?.metaid ?? ''),
        queryFn: () =>
          fetchFollowingList({
            metaid: btcConnector?.metaid ?? '',
            params: { cursor: '0', size: '100', followDetail: false },
          }),
      });
    const getTotal = async () => {
        setTotal(
            await fetchMyFollowingTotal({
                page: 1,
                size: 1,
                path: '/protocols/simplebuzz,/protocols/banana',
                metaidList: myFollowingListData?.list ?? [],
              })
        );
    };

    useEffect(() => {
        if (!isEmpty(myFollowingListData?.list ?? [])) {
          getTotal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);


      const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
      useInfiniteQuery({
        queryKey: ['following', 'buzzes'],
        enabled: !isEmpty(myFollowingListData?.list ?? []),
  
        queryFn: ({ pageParam }) =>
          fetchMyFollowingBuzzs({
            page: pageParam,
            size: 5,
            path: '/protocols/simplebuzz,/protocols/banana',
            metaidList: myFollowingListData?.list ?? [],
          }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
          const nextPage = lastPage?.length ? allPages.length + 1 : undefined;
          if (allPages.length * 5 >= (total ?? 0)) {
            return;
          }
          return nextPage;
        },
      });
    const tweets = useMemo(() => {
        return data ? data?.pages.reduce((acc, item) => {
            return [...acc||[], ...item||[]]
        }, []) : []
    }, [data])
    return <div className="homePage2">
        <div className="tweets">
            <div
                id="scrollableDiv"
                style={{
                    height: 'calc(100vh - 80px)',
                    overflow: 'auto',
                }}
            >
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