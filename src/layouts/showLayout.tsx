import { Link, Outlet, useModel, history, useIntl } from 'umi';
import { Button, Col, ConfigProvider, Divider, Dropdown, FloatButton, Grid, Input, InputNumber, Layout, Menu, Radio, Row, Segmented, Space, Tag, theme, Typography } from 'antd';
import { useEffect, useState } from 'react';
import './index.less';
import Menus from './Menus';
import { CaretDownOutlined, EditOutlined, EllipsisOutlined, LoginOutlined, PoweroffOutlined } from '@ant-design/icons';
import {
    QueryClient,
    QueryClientProvider,
    useQueryClient,
} from '@tanstack/react-query'
import NewPost from '@/Components/NewPost';
import Mobilefooter from './Mobilefooter';
import _btc from '@/assets/btc.png'
import _mvc from '@/assets/mvc.png'
import Recommend from '@/Components/Recommend';
import UserAvatar from '@/Components/UserAvatar';
import TopTool from './TopTool';
import SelectLang from './SelectLang';
const { useBreakpoint } = Grid

const { Header, Content, Footer, Sider } = Layout;

export default function ShowLayout({ children }: { children?: React.ReactNode }) {
    const { formatMessage } = useIntl()
    const queryClient = useQueryClient();
    const [collapsed, setCollapsed] = useState(false);
    const { showConf } = useModel('dashboard')
    const { user, chain, disConnect, feeRate, setFeeRate, connect, switchChain } = useModel('user')
    const { md } = useBreakpoint();
    const { token: {
        colorPrimary,
        colorTextSecondary,
        colorBgBase,
        colorBgLayout,
        colorBgContainer,
    } } = theme.useToken()




    const [showPost, setShowPost] = useState(false)
    if (!showConf) return null

    return (
        <div style={{ background: colorBgLayout, maxHeight: '100vh', overflow: 'hidden' }}>
            <Layout className='layout' style={{ width: showConf.showSliderMenu ? showConf.contentSize : '100%', }} >
                {
                    md && showConf?.showSliderMenu ?
                        <Sider style={{ background: colorBgContainer, height: '100vh' }} collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className='sider'>
                            <div>
                                <div className="logoWrap">
                                    <img src={showConf?.logo} alt="" className="logo" />
                                </div>
                                <Menus />
                            </div>
                            <Button size='large' shape='round' type='primary' style={{ background: showConf?.gradientColor }} onClick={() => { setShowPost(true) }}>
                                {formatMessage({ id: 'Post' })}
                            </Button>
                        </Sider> : ''
                }
                <Layout className='layout2' style={{ background: colorBgLayout, padding: 0, flexGrow: 1 }} >
                    <Header style={{
                        width: '100%',
                        padding: 0,
                        background: showConf?.colorHeaderBg || colorBgLayout,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }} className='header'>
                        <Row style={{ width: !showConf.showSliderMenu ? showConf.contentSize : '100%', maxWidth: "100%", }} gutter={[12, 12]}>
                            {
                                !showConf?.showSliderMenu && <Col span={6} md={showConf?.showSliderMenu ? 0 : 4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="logoWrap">
                                        <img src={showConf?.logo} alt="" className="logo" />
                                    </div>
                                </Col>
                            }

                            {md ? <Col span={24} md={showConf?.showSliderMenu ? 14 : 10}>

                                <div className="searchWrap" style={{ background: colorBgContainer }} onClick={() => { setShowPost(true) }}>
                                    <Input size="large" prefix={
                                        <EditOutlined style={{ color: showConf?.brandColor }} />
                                    } placeholder={formatMessage({
                                        id:'post_placeholder'
                                    })} variant="borderless" suffix={
                                        <Button shape='round' style={{ background: showConf?.gradientColor, color: showConf.colorButton, marginRight: 12 }} >
                                            {formatMessage({ id: 'Post' })}
                                        </Button>
                                    } />
                                </div>
                            </Col> : ''}
                            <Col span={showConf?.showSliderMenu ? 24 : 18} md={10}>
                                <div className="userPanel" style={{ background: colorBgContainer }}>
                                    <div className="user" onClick={() => { history.push('/profile') }}>
                                        <UserAvatar src={user.avater} />
                                        {
                                            !md && !showConf?.showSliderMenu ? '' : <div className='desc'>
                                                <Typography.Text className="name">
                                                    {user.name || 'Unnamed'}
                                                </Typography.Text>
                                                <Typography.Text className="metaid" style={{ whiteSpace: 'nowrap' }}>
                                                    MetaID:{user.metaid.slice(0, 8)}
                                                </Typography.Text>
                                            </div>
                                        }
                                    </div>
                                    <div className="actions">

                                        <Dropdown placement='bottomCenter' dropdownRender={() => {
                                            return <div>
                                                <Menu>
                                                    <Menu.Item key='1' disabled={chain === 'btc'} onClick={async () => {
                                                        await switchChain('btc');
                                                        queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] });
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", width: "100%", gap: 16, padding: 8 }}>
                                                            <Space>
                                                                <img src={_btc} alt="" style={{ width: 24, height: 24 }} />
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <Typography.Text style={{ lineHeight: 1 }}>BTC </Typography.Text>
                                                                    {/* <Typography.Text type='secondary' style={{ lineHeight: 1 }}>Network</Typography.Text> */}
                                                                </div>
                                                            </Space>
                                                            <InputNumber value={feeRate} onChange={(_value) => {
                                                                setFeeRate(Number(_value))
                                                            }} controls={false} suffix={'sats'}
                                                                precision={0}
                                                            >
                                                            </InputNumber>
                                                        </div>


                                                    </Menu.Item>
                                                    <Menu.Item key='2' disabled={chain === 'mvc'} onClick={() => {
                                                        switchChain('mvc')
                                                    }}>

                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", gap: 16, padding: 8 }}>
                                                            <Space>
                                                                <img src={_mvc} alt="" style={{ width: 24, height: 24 }} />
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 4
                                                                }}>
                                                                    <Typography.Text style={{ lineHeight: 1 }}>MVC  </Typography.Text>
                                                                    <Typography.Text type='secondary' style={{ lineHeight: 1 }}>  <Tag color='orange' bordered={false}>Bitcoin Sidechain</Tag></Typography.Text>

                                                                </div>
                                                            </Space>
                                                            <InputNumber value={1} disabled variant='borderless' controls={false} suffix={'sats'}
                                                                precision={0}
                                                            >
                                                            </InputNumber>
                                                        </div>


                                                    </Menu.Item>
                                                </Menu>
                                            </div>
                                        }}>

                                            <Button shape='round' type='text' variant='filled' color='default' style={{ height: 34 }}>
                                                <img src={chain === 'btc' ? _btc : _mvc} alt="" style={{ width: 24, height: 24 }} />
                                                <Typography>
                                                    <Typography.Text style={{ color: colorPrimary }}>{chain === 'btc' ? feeRate : 1} </Typography.Text>
                                                    <Typography.Text type='secondary'> sats</Typography.Text>
                                                </Typography>
                                                <CaretDownOutlined style={{ color: colorTextSecondary }} />
                                            </Button>

                                        </Dropdown>

                                        <Button shape='circle' type='text' color='default' onClick={disConnect}>
                                            <PoweroffOutlined />
                                        </Button>
                                        <SelectLang />
                                    </div>

                                </div>
                            </Col>
                        </Row>
                    </Header>
                    {
                        !showConf?.showSliderMenu && <TopTool />
                    }
                    <Content style={{ flexGrow: 1, width: !showConf.showSliderMenu ? showConf.contentSize : '100%', maxWidth: "100%", padding: 12 }}>
                        <Row gutter={[12, 12]} style={{ height: '100%', position: 'relative', padding: 0, }}>
                            <Col span={24} md={showConf?.showRecommend ? 14 : 24} style={{ height: '100%', width: '100%', overflow: 'scroll' }} >
                                {children ? children : <Outlet />}
                            </Col>
                            {
                                (md && showConf?.showRecommend) && <Col md={10} span={24}>
                                    <Recommend />
                                </Col>
                            }
                        </Row>
                    </Content>

                    {!md && showConf?.showSliderMenu ? <Footer className='footer' style={{ background: colorBgContainer }}><Mobilefooter /></Footer> : ''}
                </Layout>

                <NewPost show={showPost} onClose={() => setShowPost(false)} />
                {
                    !md && <FloatButton style={{ bottom: 100 }} icon={<EditOutlined />} onClick={() => { setShowPost(true) }} />
                }
            </Layout>
        </div>

    );
}
