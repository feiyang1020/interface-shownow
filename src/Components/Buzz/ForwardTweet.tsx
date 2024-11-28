
import Details from "./Details";


type Props = {
    buzzItem: API.Buzz
    showActions?: boolean
}

export default ({ buzzItem, showActions = true }: Props) => {
    if (!buzzItem || !buzzItem.address) return null
    return <Details buzzItem={buzzItem} showActions={false} padding={0} reLoading={false} isForward />
}