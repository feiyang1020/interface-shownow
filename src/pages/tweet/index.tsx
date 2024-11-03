import Comment from "@/Components/Comment"
import Recommend from "@/Components/Recommend"
import { Avatar, Button, Card, Col, Divider, Input, Row } from "antd"
import { useState } from "react"
import { useMatch, useModel } from "umi"

export default () => {
    const { user } = useModel('user')
    const { showConf } = useModel('dashboard')
    const match = useMatch('/tweet/:id')
    const [showComment, setShowComment] = useState(false)
    return <Row gutter={[24,24]}>
        <Col span={15}>
            <Card>tweet
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Avatar size="large" src={user?.avater} style={{ width: 48, height: 48, minWidth: 48 }} />
                    <Input value={''} placeholder="What's happening?" variant='borderless' style={{ flexGrow: 1 }} onClick={() => { setShowComment(true) }} />
                    <Button type='primary' shape='round' style={{ background: showConf?.gradientColor }} onClick={() => { }}>Reply</Button>
                </div>
                <Comment tweetId={match?.params.id} onClose={() => {
                    setShowComment(false)
                }} show={showComment} />

            </Card>
        </Col>
        <Col span={9}>
            <Recommend />
        </Col>
    </Row>
}