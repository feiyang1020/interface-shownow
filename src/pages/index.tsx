import { Button, Space, Grid, notification } from 'antd';
import logo from '../assets/logo.svg';
import bg from '../assets/bg.svg';
import './index.less';
import { useModel, history } from 'umi';
import styles from './dashboard/styles';
import ConnectWallet from '@/Components/ConnectWallet';
const { useBreakpoint } = Grid


export default function HomePage() {
  const { isLogin, setIsLogin, connect, setShowConnect: _setShowConnect } = useModel('user');
  const [api, contextHolder] = notification.useNotification();
  const { showConf } = useModel('dashboard');
  const { md } = useBreakpoint()
  const handleConnect = async () => {
    await connect();
    setTimeout(() => {
      history.push('/')
    }, 100);
  }

  const openNotification = () => {
    const key = `open${Date.now()}`;
    const btn = (
      <Space>
        <Button type="primary" style={{background:showConf?.brandColor}} size="small" onClick={() => {
          window.open(
            "https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao"
          );
          api.destroy()
        }}>
          Install Wallet Now
        </Button>
      </Space>
    );
    api.open({
      message: 'Metalat Wallet',
      description:
        "It looks like you don't have a wallet installed yet. Please install the Metalat wallet.",
      btn,
    });
  }

  const setShowConnect = (_show: boolean) => {
    if (_show && !window.metaidwallet) {
      openNotification();
      return
    }
    _setShowConnect(_show)
  }
  return (
    <div className='indexPage'>
      {md && <img src={bg} alt="" className="bgImg" />}


      <div className="indexContent">
        <div className="header">
          <img src={showConf?.logo} alt="" className="logo" />
          <Button shape='round' onClick={() => {
            setShowConnect(true)
          }} style={{ color: showConf?.brandColor }}>Connect</Button>
        </div>
        <div className="info">
          <h1>Unbounded Creation Infinite Earnings</h1>
          <p>At Show Now, post and create videos to turn your creativity and talent into interaction and revenue</p>
          <h3 style={{ marginTop: 113 }}>
            Get Started
          </h3>
          <p>Connect your wallet to create a new Account or open an existing one</p>
          <Space>
            <Button shape='round'>Twitter</Button>
            <Button type="primary" shape='round' onClick={() => {
              setShowConnect(true)
            }} style={{ background: showConf?.brandColor }}>Connect</Button  >
          </Space>
        </div>
      </div>
      <ConnectWallet />
      {contextHolder}
    </div>
  );
}
