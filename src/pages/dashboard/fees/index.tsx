import { ProCard } from "@ant-design/pro-components"
import { Button, Form, Input, InputNumber } from "antd";
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
    },
};
export default () => {

    return <ProCard split="vertical" title='Service Fee '>
        <Form
            {...formItemLayout}
            variant='filled'
            style={{ maxWidth: 600,marginTop:20 }}

        >


            <Form.Item label="Fee Address" name="Input" rules={[{ required: true, message: 'Please input!' }]}>
                <Input />
            </Form.Item>

            <Form.Item
                label="Follow"
                name="InputNumber"
                rules={[{ required: true, message: 'Please input!' }]}
            >
                <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
                label="Like"
                name="InputNumber"
                rules={[{ required: true, message: 'Please input!' }]}
            >
                <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
                label="POST"
                name="InputNumber"
                rules={[{ required: true, message: 'Please input!' }]}
            >
                <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
                label="Comment"
                name="InputNumber"
                rules={[{ required: true, message: 'Please input!' }]}
            >
                <InputNumber style={{ width: '100%' }} />
            </Form.Item>



            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    </ProCard>
}