import Buzz from "@/Components/Buzz"
import Comment from "@/Components/Comment"
import CommentPanel from "@/Components/CommentPanel"
import Recommend from "@/Components/Recommend"
import { getPinDetailByPid } from "@/request/api"
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
    const [refetchNum, setRefetchNum] = useState(0)
    const [showComment, setShowComment] = useState(false)
    const { isLoading: isQuoteLoading, data: quoteDetailData } = useQuery({
        enabled: !isEmpty(quotePinId),
        queryKey: ['buzzDetail', quotePinId],
        queryFn: () => getPinDetailByPid({ pid: quotePinId! }),
    })

    if (!quoteDetailData) return null
    return <Row gutter={[24, 24]} >
        <Col span={24} md={15}>
            <Card loading={isQuoteLoading}>
                <Buzz buzzItem={quoteDetailData} showActions={true} />
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Avatar size="large" src={user?.avater} style={{ width: 48, height: 48, minWidth: 48 }} />
                    <Input value={''} placeholder="What's happening?" variant='borderless' style={{ flexGrow: 1 }} onClick={() => { setShowComment(true) }} />
                    <Button type='primary' shape='round' style={{ background: showConf?.gradientColor }} onClick={() => { }}>Reply</Button>
                </div>
                <Comment tweetId={match?.params.id ?? ''} onClose={() => {
                    setShowComment(false);
                    setRefetchNum(refetchNum + 1)
                }} show={showComment} />
                <Divider />
                <CommentPanel tweetId={match?.params.id ?? ''} refetchNum={refetchNum} />

            </Card>
        </Col>
        <Col md={9} span={24}>
            <Recommend />
        </Col>
    </Row>
}