import { BASE_MAN_URL, curNetwork } from "@/config";
import { fetchCurrentBuzzComments } from "@/request/api";
import { useQuery } from "@tanstack/react-query";
import { Avatar, List } from "antd";
import { isNil } from "ramda";
import { useModel } from "umi";
import dayjs from 'dayjs'
import { useEffect } from "react";

type CommentPanelProps = {
    tweetId: string,
    refetchNum: number
}

const CommentItem = ({ commentRes }: { commentRes: API.CommentRes }) => {
    const { btcConnector } = useModel('user')
    const currentUserInfoData = useQuery({
        enabled: !isNil(commentRes?.pinAddress),
        queryKey: ['userInfo', commentRes?.pinAddress],
        queryFn: () =>
            btcConnector?.getUser({
                network: curNetwork,
                currentAddress: commentRes?.pinAddress,
            }),
    });
    return <List.Item>
        <List.Item.Meta
            avatar={<Avatar src={`${BASE_MAN_URL}${currentUserInfoData.data?.avatar}`} />}
            title={<a href="">{currentUserInfoData.data?.name}</a>}
            description={currentUserInfoData.data?.metaid.slice(0, 8)}
        />
        {commentRes?.content}
    </List.Item>
}

export default ({ tweetId, refetchNum }: CommentPanelProps) => {
    const commentData = useQuery({
        enabled: !isNil(tweetId),
        queryKey: ['comment-detail', tweetId],
        queryFn: () => fetchCurrentBuzzComments({ pinId: tweetId }),
    });
    useEffect(()=>{
        if(refetchNum){
            commentData.refetch()
        }
    },[refetchNum])
    const commentsNum = (commentData?.data ?? []).length;
    return <List
        itemLayout="horizontal"
        dataSource={commentData?.data ?? []}
        renderItem={(item, index) => (
            <CommentItem commentRes={item} />
        )}
    />
}