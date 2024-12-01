import { ProCard, ProFormColorPicker } from '@ant-design/pro-components';
import { Avatar, Button, ColorPicker, Divider, Input, message, notification, Space, Tabs, Upload } from 'antd';
import type { TabsProps } from 'antd';
import { useEffect, useState } from 'react';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { saveConf } from '@/request/dashboard';
import RcResizeObserver from 'rc-resize-observer';

const DEFAULT_COLOR = [
    {
        color: '#f824da',
        percent: 0,
    },
    {
        color: '#ff5815',
        percent: 100,
    },
];
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};
export default () => {
    const { showConf, loading, fetchConfig } = useModel('dashboard')
    const [styles, setStyles] = useState<DB.ShowConfDto>();
    const [submiting, setSubmiting] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const [responsive, setResponsive] = useState(false);
    useEffect(() => {
        if (showConf) {
            console.log(showConf, 'showConf');
            setStyles(prev => {
                if (!prev) {
                    return showConf
                } else {
                    return prev
                }
            })
        }

    }, [showConf])
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const props: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            console.log(file);
            getBase64(file as FileType, (url) => {
                // setLoading(false);
                console.log(url);
                setImageUrl(url);
                if (styles) {
                    setStyles({ ...styles, logo: url });
                }
            });
            return false;
        },
        fileList,
    };

    const handleChange: UploadProps['onChange'] = (info) => {
        console.log(info, info.file.status, 'info.file.status');
        if (info.file.status === 'uploading') {
            //   setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj as FileType, (url) => {
                // setLoading(false);
                setImageUrl(url);
                if (styles) {
                    setStyles({ ...styles, logo: url });
                }
            });
        }
    };

    const openNotification = () => {
        const key = `open${Date.now()}`;
        const btn = (
            <Space>
                <Button type="link" size="small" onClick={() => {
                    api.destroy();
                    history.push('/')
                }}>
                    View
                </Button>
            </Space>
        );
        api.open({
            message: 'Save Success',
            btn,
            key,
            onClose: close,
        });
    };

    const handleSave = async () => {
        if (!styles) return;
        setSubmiting(true);
        try {
            await saveConf({ ...styles, alias: 'default' });
            await fetchConfig();
            openNotification();
        } catch (e: any) {
            console.log(e);
            message.error(e.message)
        }
        setSubmiting(false);

    }

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Color',
            children: <div >

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Brand Color</span>
                    <ColorPicker size="large" showText value={styles && styles.brandColor} onChange={(color) => {
                        if (styles) {
                            setStyles({ ...styles, brandColor: color.toRgbString() });
                        }

                    }} />
                </div>
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Gradient Color</span>
                    <ColorPicker
                        defaultValue={DEFAULT_COLOR}
                        allowClear

                        size="large"
                        mode={['single', 'gradient']}
                        onChangeComplete={(color) => {
                            console.log(color.toCssString());
                            if (styles) {
                                setStyles({ ...styles, gradientColor: color.toCssString() });
                            }

                        }}
                    />
                </div>

            </div>,
        },
        {
            key: '2',
            label: 'Size',
            children: 'Coming Soon',
        },
        {
            key: '3',
            label: 'Brand',
            children: <Space direction="vertical" style={{ width: '100%' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Logo</span>

                    <Upload {...props} listType="picture" maxCount={1} onChange={handleChange}>
                        <Button icon={<UploadOutlined />}>Select Image</Button>
                    </Upload>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',gap:24 }}>
                    <span>Twitter</span>

                    <Input value={styles?.twitterUrl} onChange={(e) => {
                        if (styles) {
                            setStyles({ ...styles, twitterUrl: e.target.value });
                        }

                    }} />
                </div>
            </Space>,
        },
    ];

    if (!styles) return <div>no data</div>
    return <div>
        {contextHolder}
        <RcResizeObserver
            key="resize-observer"
            onResize={(offset) => {
                setResponsive(offset.width < 596);
            }}
        >
            <ProCard split={responsive ? 'horizontal' : 'vertical'}>

                <ProCard title="" colSpan={responsive ? 24 : 8}  >
                    <Tabs defaultActiveKey="1" items={items} />
                </ProCard>
                <ProCard colSpan={responsive ? 24 : 16} title="OverView" headerBordered extra={
                    <Button type="primary" onClick={handleSave} loading={submiting}>Save</Button>}
                >
                    <div style={{ height: '100vh' }}>
                        <Space direction="vertical" size="large">
                            <Button type="primary" style={{ background: styles.brandColor }}>Brand Button  </Button>
                            <Button type="primary" style={{ background: styles.gradientColor }}>Gradient Button</Button>
                            <img height={64} src={styles.logo ? styles.logo : ''} />
                        </Space>


                    </div>
                </ProCard>
            </ProCard>
        </RcResizeObserver>
    </div>
}