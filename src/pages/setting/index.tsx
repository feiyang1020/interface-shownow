import UploadAvatar from "@/Components/ProfileCard/UploadAvatar";
import { curNetwork } from "@/config";
import { image2Attach } from "@/utils/file";
import { PlusOutlined } from "@ant-design/icons"
import { Button, Card, Form, Input, message, Upload } from "antd"
import { useModel } from "umi"
const normFile = (e: any) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};

export default () => {
    const { showConf } = useModel('dashboard');
    const { user, btcConnector, mvcConnector, chain, feeRate } = useModel('user');
    const [form] = Form.useForm();

    const updateUser = async () => {
        const values = form.getFieldsValue();
        console.log(values);
        if (typeof values.avatar !== 'string') {
            const [image] = await image2Attach([values.avatar] as FileList);
            values.avatar = Buffer.from(image.data, "hex").toString("base64")
        }
        if (typeof values.background !== 'string') {
            const [image] = await image2Attach([values.background] as FileList);
            values.background = Buffer.from(image.data, "hex").toString("base64")
        }
        const connector = chain === 'btc' ? btcConnector : mvcConnector;
        try {
            if (user.name) {
                const res = await connector!.updateUserInfo({
                    userData: {
                        ...user,
                        ...values
                    },
                    options: {
                        feeRate: Number(feeRate),
                        network: curNetwork,
                    },
                }).catch(e => {
                    throw new Error(e)
                });;
                if (!res) {
                    message.error('Update Failed')
                } else {
                    message.success('Update Successfully')
                }
            } else {
                const res = await connector!.createUserInfo({
                    userData: values,
                    options: {
                        feeRate: Number(feeRate),
                        network: curNetwork,
                    },
                }).catch(e => {
                    throw new Error(e)
                });
                console.log(res);
                if (!res) {
                    message.error('Create Failed')
                } else {
                    message.success('Create Successfully')

                }
            }
        } catch (e) {
            message.error(e.message)
        }
    }
    return <div>
        <Button shape='round' style={{ color: '#fff', background: showConf?.gradientColor }}>Account</Button>
        <Card title="Personal data" style={{ marginTop: 12 }} bordered={false} extra={
            <Button shape='round' type="primary" style={{ color: '#fff', background: showConf?.gradientColor }} onClick={updateUser}>Save</Button>
        }>
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                style={{ maxWidth: 600 }}
                initialValues={{
                    name: user?.name,
                    avatar: user?.avater
                }}
                form={form}
            >
                <Form.Item label="Name" name='name'>
                    <Input />
                </Form.Item>
                <Form.Item label="Avatar" name='avatar'>
                    <UploadAvatar />
                </Form.Item>

                <Form.Item label="Background" name='background'>
                    <UploadAvatar />
                </Form.Item>

            </Form>


        </Card>

    </div>
}