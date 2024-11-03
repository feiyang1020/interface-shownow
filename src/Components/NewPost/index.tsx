
import { useModel } from "umi"
import Popup from "../ResponPopup"
import UserInfo from "../UserInfo"
import { Button, Input, Space } from "antd";
import { FileImageOutlined, VideoCameraOutlined } from "@ant-design/icons";
const { TextArea } = Input;
type Props = {
    show: boolean,
    onClose: () => void
}
export default ({ show, onClose }: Props) => {
    const { user } = useModel('user')
    const { showConf } = useModel('dashboard')
    return <Popup onClose={onClose} show={show} modalWidth={800} closable >
        <div>
            <UserInfo user={user} />
            <TextArea rows={6} placeholder="What is happening？" style={{ marginTop: 24 }} />
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                    <Button icon={<FileImageOutlined style={{ color: showConf?.brandColor }} />} type='text'></Button>
                    <Button disabled icon={<VideoCameraOutlined style={{ color: showConf?.brandColor }} />} type='text'></Button>

                </Space>
                <Button type='primary'  shape='round' style={{ background: showConf?.gradientColor }} onClick={() => {  }}>
                    Post
                </Button>
            </div>
        </div>
    </Popup>
}