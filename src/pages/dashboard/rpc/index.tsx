import { FooterToolbar, ProCard, ProForm, ProFormText } from "@ant-design/pro-components"
import { Col, Divider, Row, Space } from "antd"

export default () => {
    return <ProCard split="vertical"  >
        <ProForm style={{ padding: 24 }}
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            submitter={{
                searchConfig:{
                    submitText: 'Save',
                    resetText: 'Reset'
                },
                render: (props, doms) => {
                    return <Row>
                        <Col span={14} offset={4}>
                            <Space>{doms}</Space>
                        </Col>
                    </Row>
                },
            }}

        >


            <Divider orientation="left">BTC RPC Config</Divider>
            <ProFormText
                width="md"
                name="btc_rpc_host"
                label="BTC RPC Host"
                placeholder="Example: 127.0.0.1:8332"
            />
            <ProFormText
                width="md"
                name="btc_rpc_user"
                label="BTC RPC Username"
                placeholder="Enter the username for accessing BTC RPC"
            />
            <ProFormText
                width="md"
                name="btc_rpc_pass"
                label="BTC RPC Password"
                placeholder="Enter the password for accessing BTC RPC"
            />
            <ProFormText
                width="md"
                name="btc_rpc_rawtx"
                label="BTC ZMQ Raw Transaction URL"
                placeholder="Example: tcp://127.0.0.1:18332"
            />

            <Divider orientation="left">MVC RPC Config</Divider>
            <ProFormText
                width="md"
                name="mvc_rpc_host"
                label="MVC RPC Host"
                placeholder="Example: 127.0.0.1:8332"
            />
            <ProFormText
                width="md"
                name="mvc_rpc_user"
                label="MVC RPC Username"
                placeholder="Enter the username for accessing MVC RPC"
            />
            <ProFormText
                width="md"
                name="mvc_rpc_pass"
                label="MVC RPC Password"
                placeholder="Enter the password for accessing MVC RPC"
            />
            <ProFormText
                width="md"
                name="mvc_rpc_rawtx"
                label="MVC ZMQ Raw Transaction URL"
                placeholder="Example: tcp://127.0.0.1:18332"
            />

        </ProForm>
    </ProCard>
}