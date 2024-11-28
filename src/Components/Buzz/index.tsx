
import Details from "./Details";

type Props = {
    buzzItem: API.Buzz
    showActions?: boolean,
    padding?: number
    reLoading?: boolean
    refetch?: () => Promise<any>
}

export default ({ buzzItem, showActions = true, padding = 20, reLoading = false, refetch }: Props) => {
    return <Details buzzItem={buzzItem} showActions={showActions} padding={padding} reLoading={reLoading} refetch={refetch} isForward={false} />
}