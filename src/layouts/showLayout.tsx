import { Link, Outlet, useModel } from 'umi';
import { Button, Col, ConfigProvider, Divider, Dropdown, FloatButton, Grid, Input, InputNumber, Layout, Menu, Row, Space, theme, Typography } from 'antd';
import { useEffect, useState } from 'react';
import './index.less';
import Menus from './Menus';
import { CaretDownOutlined, EditOutlined, EllipsisOutlined, LoginOutlined } from '@ant-design/icons';
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
const { useBreakpoint } = Grid

const { Header, Content, Footer, Sider } = Layout;

export default function ShowLayout() {
    const queryClient = useQueryClient();
    const [collapsed, setCollapsed] = useState(false);
    const { showConf } = useModel('dashboard')
    const { user, chain, disConnect, feeRate, setFeeRate, connect, switchChain } = useModel('user')
    const { md } = useBreakpoint();
    const { token: {
        colorBgLayout,
        colorBgContainer,
        colorBgElevated
    } } = theme.useToken()


    const [showPost, setShowPost] = useState(false)

    return (
        <div style={{ background: colorBgLayout }}>
            <Layout className='layout'>
                {
                    md && showConf?.showMenu ?

                        <Sider style={{ background: colorBgContainer, height: '100vh' }} collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className='sider'>
                            <div>
                                <div className="logoWrap">
                                    <img src={showConf?.logo} alt="" className="logo" />
                                </div>
                                <Menus />

                            </div>
                            <Button size='large' shape='round' className='siderAction' style={{ background: showConf?.gradientColor }} onClick={() => { setShowPost(true) }}>
                                Post
                            </Button>

                        </Sider> : ''
                }
                <Layout className='layout2' style={{ background: colorBgLayout, }}>
                    <Header style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        width: '100%',
                        padding: 0,
                        // background: " #f6f9fc",
                        background: colorBgLayout
                    }} className='header'>
                        <Row style={{ width: '100%', flexGrow: 1 }} gutter={[12, 12]}>
                            {md ? <Col span={24} md={15}>
                                <div className="searchWrap" style={{ background: colorBgContainer }} onClick={() => { setShowPost(true) }}>
                                    <Input size="large" prefix={
                                        <EditOutlined style={{ color: showConf?.brandColor }} />
                                    } placeholder='What is happening？' variant="borderless" suffix={
                                        <Button shape='round' style={{ background: showConf?.gradientColor, color: '#fff', marginRight: 12 }} > Post</Button>
                                    } />
                                </div>
                            </Col> : ''}
                            <Col span={24} md={9}>
                                <div className="userPanel" style={{ background: colorBgContainer }}>
                                    <div className="user">
                                        <UserAvatar src={user.avater} />
                                        <div className='desc'>
                                            <Typography.Text className="name">
                                                {user.name || 'Unnamed'}
                                            </Typography.Text>
                                            <Typography.Text className="metaid">
                                                MetaID：{user.metaid.slice(0, 8)}
                                            </Typography.Text>
                                        </div>

                                    </div>
                                    <div className="actions">
                                        {/* <Badge count={user.notice} className='action'>
                        <BellOutlined style={{ fontSize: 20 }} />
                      </Badge> */}
                                        {/* <MessageOutlined style={{ fontSize: 20 }} className='action' /> */}
                                        <Dropdown dropdownRender={() => {
                                            return <div>
                                                <Menu>
                                                    <Menu.Item key='1' disabled={chain === 'btc'} onClick={async () => {
                                                        await switchChain('btc');
                                                        queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] });
                                                    }}>
                                                        <Space>
                                                            <img src={_btc} alt="" style={{ width: 20, height: 20 }} />
                                                            BTC Netwotk
                                                        </Space>

                                                    </Menu.Item>
                                                    <Menu.Item key='2' disabled={chain === 'mvc'} onClick={() => {
                                                        switchChain('mvc')
                                                    }}>
                                                        <Space>
                                                            <img src={_mvc} alt="" style={{ width: 20, height: 20 }} />
                                                            MVC Network
                                                        </Space>

                                                    </Menu.Item>
                                                </Menu>
                                            </div>
                                        }}>

                                            <Button shape='round' type='text'>
                                                <img src={chain === 'btc' ? _btc : _mvc} alt="" style={{ width: 20, height: 20 }} />
                                                <CaretDownOutlined />
                                            </Button>

                                        </Dropdown>
                                        <Dropdown placement='bottom' arrow dropdownRender={() => {
                                            return <div
                                                style={{
                                                    background: colorBgElevated,
                                                    minWidth: 200,
                                                    padding: 12,
                                                    borderRadius: 8,
                                                    display: 'flex',
                                                    flexDirection: 'column',

                                                    boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span>
                                                        Fee Rate
                                                    </span>
                                                    <InputNumber value={feeRate} onChange={(_value) => {
                                                        setFeeRate(Number(_value))
                                                    }} variant='filled' controls={false} suffix={'sats'}
                                                        precision={0}

                                                    >
                                                    </InputNumber>

                                                </div>
                                                {/* <Divider style={{ margin: '12px 0' }} /> */}
                                                {/* <Button type='text' icon={<SwitcherOutlined />} onClick={() => {
                            connect(chain === 'btc' ? 'mvc' : 'btc')
                          }}>
                            Switch To <Tag bordered={false} color={chain !== 'mvc' ? 'blue' : 'orange'}>{chain === 'btc' ? 'mvc' : 'btc'}</Tag>
                          </Button> */}
                                                <Divider style={{ margin: '12px 0' }} />
                                                <Button danger type='text' icon={<LoginOutlined />} onClick={() => {
                                                    disConnect()
                                                }}>
                                                    Log Out
                                                </Button>
                                            </div>
                                        }}>

                                            <EllipsisOutlined style={{ fontSize: 20 }} className='action' />
                                        </Dropdown>

                                    </div>

                                </div>
                            </Col>
                        </Row>

                    </Header>
                    <Row gutter={[12, 12]}>
                        <Col span={24} md={showConf?.showRecommend ? 15 : 24}>
                            <Outlet />
                        </Col>
                        {
                            (md && showConf?.showRecommend) && <Col md={9} span={24}>
                                <Recommend />
                            </Col>
                        }
                    </Row>
                    {!md ? <Footer className='footer' style={{background:colorBgContainer}}><Mobilefooter /></Footer> : ''}
                </Layout>

                <NewPost show={showPost} onClose={() => setShowPost(false)} />
                {
                    !md && <FloatButton style={{ bottom: 100 }} icon={<EditOutlined />} onClick={() => { setShowPost(true) }} />
                }
            </Layout>
        </div>

    );
}
