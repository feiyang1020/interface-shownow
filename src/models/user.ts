import { useCallback, useEffect, useState } from "react";
import { MetaletWalletForBtc } from "@metaid/metaid";
import {
  IMetaletWalletForBtc,
  IBtcConnector,
  btcConnect,
} from "@metaid/metaid";
import { curNetwork, getHostByNet } from "@/config";
const checkExtension = () => {
  if (!window.metaidwallet) {
    window.open(
      "https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao"
    );
    return false;
  }
  return true;
};
export default () => {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState({
    avater: "https://api.dicebear.com/7.x/miniavs/svg?seed=2",
    name: "Bradley",
    metaid: "001Derteryeryeryeryey7777324e",
    notice: 1,
    address:''
  });

  const [addressType, setAddressType] = useState<string>();
  const [metaid, setMetaid] = useState<string>();
  const [btcAddress, setBTCAddress] = useState<string>();
  const [btcConnector, setBtcConnector] = useState<IBtcConnector>();
  const [network, setNetwork] = useState<Network>(curNetwork);
  const [connected, setConnected] = useState<boolean>(false);
  const [userBal, setUserBal] = useState<string>("0");
  const [avatar, setAvatar] = useState<string>("");
  const [userName, setUserName] = useState<string>();
  const [initializing, setInitializing] = useState<boolean>(true);

  const [feeRates, setFeeRates] = useState<
    {
      label: string;
      value: number;
      time: string;
      icon: string;
      activeIcon: string;
    }[]
  >([]);
  const [feeRate, setFeeRate] = useState<number>(0);
  const [feeRateType, setFeeRateType] = useState<string>("");
  const [feeRateModalVisible, setFeeRateModelVisible] =
    useState<boolean>(false);

  const connect = async () => {
    if (!checkExtension()) return;
    let { network: _net, status } = await window.metaidwallet.getNetwork();
    let _wallet: IMetaletWalletForBtc | undefined = undefined;
    if (status === "not-connected") {
      _wallet = await MetaletWalletForBtc.create();
      _net = (await window.metaidwallet.getNetwork()).network;
    }
    if (_net !== curNetwork) {
      const ret = await window.metaidwallet.switchNetwork(
        curNetwork === "testnet" ? "testnet" : "livenet"
      );
      if (ret.status === "canceled") return;
      const { network } = await window.metaidwallet.getNetwork();
      if (network !== curNetwork) {
        return;
      }
    }
    if (_wallet === undefined) {
      _wallet = await MetaletWalletForBtc.create();
    }
    if (!_wallet.address) return;

    const publicKey = await window.metaidwallet.btc.getPublicKey();
   
    setNetwork(curNetwork);
   
    const _btcConnector: IBtcConnector = await btcConnect({
      wallet: _wallet,
      network,
    });
    const _walletParams = {
      address: _wallet.address,
      pub: publicKey,
    };
    sessionStorage.setItem("walletParams", JSON.stringify(_walletParams));
    setInitializing(true);
    setBtcConnector(_btcConnector);
    setIsLogin(true);
    console.log('isLogin',isLogin)
    setAvatar(
      _btcConnector.user.avatar
        ? `${getHostByNet(network)}${_btcConnector.user.avatar}`
        : ""
    );
    setUser({
      avater: _btcConnector.user.avatar
      ? `${getHostByNet(network)}${_btcConnector.user.avatar}`
      : "",
      name: _btcConnector.user.name,
      metaid: _btcConnector.user.metaid,
      notice: 0,
      address:_btcConnector.wallet.address
    })
    setInitializing(false);
  };

  const disConnect = async () => {
    setIsLogin(false);
    setBTCAddress("");
    setUserBal("");
    setBtcConnector(undefined);
    setAddressType(undefined);
    setAvatar("");
    setMetaid("");
    setUserName("");
  };
  useEffect(() => {
    const handleAccountChange = (newAccount: any) => {
      disConnect();
    };
    const handleNetChange = (network: string) => {
      disConnect();
    };
    if ( window.metaidwallet && isLogin) {
      window.metaidwallet.on("accountsChanged", handleAccountChange);
      window.metaidwallet.on("networkChanged", handleNetChange);
    }

    return () => {
      if ( window.metaidwallet && isLogin) {
        window.metaidwallet.removeListener(
          "accountsChanged",
          handleAccountChange
        );
        window.metaidwallet.removeListener("networkChanged", handleNetChange);
      }
    };
  }, [ isLogin]);

  const init = useCallback(async () => {
    if ( window.metaidwallet) {
      const _network = (await window.metaidwallet.getNetwork()).network;
      if (_network !== curNetwork) {
        disConnect();
        setInitializing(false);
        return;
      }
      setNetwork(_network);
      const walletParams = sessionStorage.getItem("walletParams");
      if (walletParams) {
        
        const _walletParams = JSON.parse(walletParams);
       
        const _wallet = MetaletWalletForBtc.restore({
          ..._walletParams,
          internal: window.metaidwallet,
        });
        const btcAddress = await window.metaidwallet.btc.getAddress();
        const pubKey = await window.metaidwallet.btc.getPublicKey();
        if (btcAddress !== _walletParams.address) {
          disConnect();
          setInitializing(false);
          return;
        }
        if (pubKey !== _walletParams.pub) {
          disConnect();
          setInitializing(false);
          return;
        }
       
        const _btcConnector: IBtcConnector = await btcConnect({
          wallet: _wallet,
          network: _network,
        });

        setBtcConnector(_btcConnector);
        setIsLogin(true);
        setMetaid(_btcConnector.metaid);
       
        setUser({
          avater: _btcConnector.user.avatar
          ? `${getHostByNet(network)}${_btcConnector.user.avatar}`
          : "",
          name: _btcConnector.user.name,
          metaid: _btcConnector.user.metaid,
          notice: 0,
          address:_btcConnector.wallet.address
        })
        setInitializing(false);
      }
    }
    setInitializing(false);
  }, []);
  useEffect(() => {
    //
    setTimeout(() => {
      init();
    }, 500);
  }, [init]);
  return {
    isLogin,
    setIsLogin,
    user,
    connect,
    disConnect,
    initializing,
    btcConnector
  };
};
