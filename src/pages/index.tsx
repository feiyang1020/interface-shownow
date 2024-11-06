import { Button, Space, Grid } from 'antd';
import logo from '../assets/logo.svg';
import bg from '../assets/bg.svg';
import './index.less';
import { useModel, history } from 'umi';
import styles from './dashboard/styles';
import ConnectWallet from '@/Components/ConnectWallet';
const { useBreakpoint } = Grid


export default function HomePage() {
  const { isLogin, setIsLogin, connect, setShowConnect } = useModel('user');
  const { showConf } = useModel('dashboard');
  const { md } = useBreakpoint()
  const handleConnect = async () => {
    await connect();
    setTimeout(() => {
      history.push('/')
    }, 100);

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
            <Button type="primary" shape='round' onClick={()=>{
              setShowConnect(true)
            }} style={{ background: showConf?.brandColor }}>Connect</Button  >
          </Space>
        </div>
      </div>
      <ConnectWallet />
    </div>
  );
}
