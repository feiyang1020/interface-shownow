import { Link, Outlet, useModel } from 'umi';
import { Avatar, Badge, Breadcrumb, Button, Col, ConfigProvider, Dropdown, Input, Layout, Menu, Row, theme } from 'antd';
import { useEffect, useState } from 'react';
import logo from '@/assets/logo.svg';
import './index.less';
import Menus from './Menus';
import { BellOutlined, EllipsisOutlined, LoginOutlined, MessageOutlined, NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import NewPost from '@/Components/NewPost';

const queryClient = new QueryClient()
const { Header, Content, Footer, Sider } = Layout;

export default function Lay() {
  const [collapsed, setCollapsed] = useState(false);
  const { showConf } = useModel('dashboard')
  const { user, setIsLogin, disConnect } = useModel('user')
  const [themeTokens, setThemeTokens] = useState({});
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
        <Layout style={{ minHeight: '100vh', width: 1200, }} className='layout'>
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

          </Sider>
          <Layout className='layout2'>
            <Header style={{ padding: 0, background: " #f6f9fc",width:'100%' }} className='header'>
              <Row style={{width:'100%',flexGrow:1}} gutter={[24,24]}>
                <Col span={15}>
                  <div className="searchWrap">
                    <Input size="large" placeholder="Search" prefix={<SearchOutlined style={{ opacity: 0.5 }} />} variant="borderless" />
                  </div>
                </Col>
                <Col span={9}>
                  <div className="userPanel">
                    <div className="user">
                      <Avatar size="large" src={user.avater} />
                      <div className='desc'>
                        <div className="name">
                          {user.name}
                        </div>
                        <div className="metaid">
                          MetaID：{user.metaid.slice(0, 8)}
                        </div>
                      </div>

                    </div>
                    <div className="actions">
                      <Badge count={user.notice} className='action'>
                        <BellOutlined style={{ fontSize: 20 }} />
                      </Badge>
                      <MessageOutlined style={{ fontSize: 20 }} className='action' /><Dropdown placement='bottom' dropdownRender={() => {
                        return <div
                          className="dropdown"
                          onClick={() => {
                            disConnect()
                          }}
                        >
                          <LoginOutlined />
                          <div className="path" >Log Out</div>

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
          </Layout>
          <NewPost show={showPost} onClose={() => setShowPost(false)} />
        </Layout>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
