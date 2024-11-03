import { Avatar } from "antd"
import './index.less'

type Props = {
    user: {
        avater: string,
        name: string,
        metaid: string
    }

}
export default ({ user }: Props) => {

    return <div className="userInfo">
        <Avatar size="large" src={user.avater} />
        <div className='desc'>
            <div className="name">
                {user.name}
            </div>
            <div className="metaid">
                MetaID：{user.metaid.slice(0, 8)}
            </div>
        </div>

    </div>
}