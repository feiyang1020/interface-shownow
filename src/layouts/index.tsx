import { Link, Outlet, useModel } from 'umi';
import { Avatar, Badge, Button, Col, ConfigProvider, Divider, Dropdown, FloatButton, Grid, Input, InputNumber, Layout, Menu, Row, Space, Tag, theme } from 'antd';
import { useEffect, useState } from 'react';
import logo from '@/assets/logo.svg';
import './index.less';
import Menus from './Menus';
import { BellOutlined, CaretDownOutlined, DownOutlined, EditOutlined, EllipsisOutlined, LoginOutlined, MessageOutlined, NotificationOutlined, SearchOutlined, SwitcherOutlined } from '@ant-design/icons';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import NewPost from '@/Components/NewPost';
import Mobilefooter from './Mobilefooter';
import _btc from '@/assets/btc.png'
import _mvc from '@/assets/mvc.png'
import { Divide, Pencil } from 'lucide-react';
const { useBreakpoint } = Grid

const queryClient = new QueryClient()
const { Header, Content, Footer, Sider } = Layout;

export default function Lay() {
  const [collapsed, setCollapsed] = useState(false);
  const { showConf } = useModel('dashboard')
  const { user, chain, disConnect, feeRate, setFeeRate, connect } = useModel('user')
  const [themeTokens, setThemeTokens] = useState({});
  const { md } = useBreakpoint()

  useEffect(() => {
    if (showConf) {
      setThemeTokens({
        token: {
          colorPrimary: showConf.brandColor,
          coloeLink: showConf.brandColor,
        },
        components: {
          "Avatar": {
            "colorTextPlaceholder": showConf.brandColor,
          },
          "Button": {
            "defaultBorderColor": "rgba(217,217,217,0)",
            "defaultShadow": "0 2px 0 rgba(0, 0, 0,0)"
          }
        }
      })
    }

  }, [showConf])

  const [showPost, setShowPost] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          ...themeTokens,
        }}
      >
        <Layout style={{ width: 1200, }} className='layout'>
          {
            md ?

              <Sider style={{ background: '#fff', height: '100vh' }} collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className='sider'>
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
          <Layout className='layout2'>
            <Header style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              width: '100%',
              padding: 0,
              background: " #f6f9fc",
            }} className='header'>
              <Row style={{ width: '100%', flexGrow: 1 }} gutter={[12, 12]}>
                {md ? <Col span={24} md={15}>
                  <div className="searchWrap">
                    <Input size="large" placeholder="Search" prefix={<SearchOutlined style={{ opacity: 0.5 }} />} variant="borderless" />
                  </div>
                </Col> : ''}
                <Col span={24} md={9}>
                  <div className="userPanel">
                    <div className="user">
                      <Avatar size="large" src={user.avater} />
                      <div className='desc'>
                        <div className="name">
                          {user.name || 'Unnanmed'}
                        </div>
                        <div className="metaid">
                          MetaID：{user.metaid.slice(0, 8)}
                        </div>
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
                            <Menu.Item key='1' disabled={chain === 'btc'} onClick={() => {
                              connect('btc')
                            }}>
                              <Space>
                                <img src={_btc} alt="" style={{ width: 20, height: 20 }} />
                                BTC Netwotk
                              </Space>

                            </Menu.Item>
                            <Menu.Item key='2' disabled={chain === 'mvc'} onClick={() => {
                              connect('mvc')
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
                            background: '#fff',
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
            <Outlet />
            {!md ? <Footer className='footer'><Mobilefooter /></Footer> : ''}
          </Layout>

          <NewPost show={showPost} onClose={() => setShowPost(false)} />
          {
            !md && <FloatButton style={{ bottom: 100 }} icon={<EditOutlined />} onClick={() => { setShowPost(true) }} />
          }
        </Layout>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
