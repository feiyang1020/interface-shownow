import Buzz from "@/Components/Buzz"
import Comment from "@/Components/Comment"
import CommentPanel from "@/Components/CommentPanel"
import Recommend from "@/Components/Recommend"
import { fetchBuzzDetail, getPinDetailByPid } from "@/request/api"
import { ArrowLeftOutlined, LeftOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Avatar, Button, Card, Col, Divider, Input, Row } from "antd"
import { isEmpty } from "ramda"
import { useState } from "react"
import { useMatch, useModel } from "umi"

export default () => {
    const { user } = useModel('user')
    const { showConf } = useModel('dashboard')
    const match = useMatch('/tweet/:id')
    const quotePinId = match?.params.id
    const [refetchNum, setRefetchNum] = useState(0);
    const [reLoading, setReLoading] = useState(false)
    const [showComment, setShowComment] = useState(false)
    const { isLoading: isQuoteLoading, data: buzzDetail, refetch } = useQuery({
        enabled: !isEmpty(quotePinId),
        queryKey: ['buzzDetail', quotePinId, user.address],
        queryFn: () => fetchBuzzDetail({ pinId: quotePinId! }),
    })

    if (!buzzDetail) return null;

    return (<Card loading={isQuoteLoading} title={
        <Button type="text" size='small' icon={<LeftOutlined />} onClick={() => history.back()}>

        </Button>
    } styles={{
        header: {
            borderBottom: 'none',
            minHeight: 30,
            padding: '12px 20px'
        },
        body: {

        }
    }}>
        <Buzz buzzItem={buzzDetail.data.tweet} showActions={true} padding={0} reLoading={reLoading} refetch={refetch} like={buzzDetail.data.like} />
        <Divider />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Avatar size="large" src={user?.avater} style={{ width: 48, height: 48, minWidth: 48 }} />
            <Input value={''} placeholder="What's happening?" variant='borderless' style={{ flexGrow: 1 }} onClick={() => { setShowComment(true) }} />
            <Button type='primary' shape='round' style={{ background: showConf?.gradientColor }} onClick={() => { }}>Reply</Button>
        </div>
        <Comment tweetId={match?.params.id ?? ''} refetch={refetch} onClose={() => {
            setShowComment(false);
            setRefetchNum(refetchNum + 1);
            setReLoading(!reLoading)
        }} show={showComment} />
        <Divider />
        <CommentPanel tweetId={match?.params.id ?? ''} refetchNum={refetchNum} commentData={buzzDetail?.data.comments} />

    </Card>)

}