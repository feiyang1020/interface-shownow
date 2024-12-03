import { ArrowLeftOutlined, LeftOutlined } from "@ant-design/icons";
import { Button, ConfigProvider, Radio, theme } from "antd";
import { useLocation, history, useModel } from "umi";
const indexPath = ['/home', '/follow', '/']
export default () => {
    const { showConf } = useModel('dashboard')
    const location = useLocation();
    const path = location.pathname;
    console.log(path, 'path')
    const { token: {
        colorBgBase
    } } = theme.useToken()

    return <>
        {
            indexPath.includes(path) ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ConfigProvider
                    theme={{
                        components: {
                            Radio: {
                                buttonSolidCheckedColor: colorBgBase,
                                buttonPaddingInline: 32
                            },
                        },
                    }}>
                    <Radio.Group block options={[
                        {
                            label: 'New',
                            value: '/home'
                        },
                        {
                            label: 'Follow',
                            value: '/follow'
                        }
                    ]} defaultValue="/home" onChange={(e) => {
                        history.push(e.target.value)
                    }} optionType="button" buttonStyle="solid" size='large' style={{ color: '#000' }} />
                </ConfigProvider>

            </div> : <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: "flex-start", width: showConf?.contentSize ,maxWidth:'calc( 100vw - 24px )' }}>
                <Button type="text" size='large' onClick={() => history.back()} icon={<LeftOutlined/>}>
                    Back
                </Button>
            </div>
        }
    </>
}