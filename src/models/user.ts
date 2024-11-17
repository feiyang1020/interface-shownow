import { useCallback, useEffect, useState } from "react";
import {
  IMvcConnector,
  MetaletWalletForBtc,
  MetaletWalletForMvc,
  mvcConnect,
} from "@metaid/metaid";
import {
  IMetaletWalletForBtc,
  IBtcConnector,
  btcConnect,
} from "@metaid/metaid";
import { curNetwork, getHostByNet } from "@/config";
import { useQuery } from "@tanstack/react-query";
import { fetchFeeRate, fetchFollowingList } from "@/request/api";
import useIntervalAsync from "@/hooks/useIntervalAsync";
import { isEmpty } from "ramda";
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
  const [chain, setChain] = useState<API.Chain>(
    (localStorage.getItem("show_chain") as API.Chain) || "btc"
  );
  const [showConnect, setShowConnect] = useState(false);
  const [user, setUser] = useState({
    avater: "",
    name: "",
    metaid: "",
    notice: 1,
    address: "",
    background: "",
  });

  const [btcConnector, setBtcConnector] = useState<IBtcConnector>();
  const [mvcConnector, setMvcConnector] = useState<IMvcConnector>();
  const [network, setNetwork] = useState<API.Network>(curNetwork);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [feeRate, setFeeRate] = useState<number>(0);
  const [followList, setFollowList] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [feeRateModalVisible, setFeeRateModelVisible] =
    useState<boolean>(false);
  const connect = async (chain: API.Chain = "btc") => {
    if (!checkExtension()) return;
    let { network: _net, status } = await window.metaidwallet.getNetwork();
    let _wallet: IMetaletWalletForBtc | MetaletWalletForMvc | undefined =
      undefined;
    if (status === "not-connected") {
      _wallet =
        chain === "btc"
          ? await MetaletWalletForBtc.create()
          : ((await MetaletWalletForMvc.create()) as MetaletWalletForMvc);
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
      _wallet =
        chain === "btc"
          ? await MetaletWalletForBtc.create()
          : ((await MetaletWalletForMvc.create()) as MetaletWalletForMvc);
    }
    if (!_wallet.address) return;

    const publicKey = await window.metaidwallet.btc.getPublicKey();

    setNetwork(curNetwork);

    const connector: IBtcConnector | IMvcConnector =
      chain === "btc"
        ? await btcConnect({
            wallet: _wallet as IMetaletWalletForBtc,
            network,
          })
        : await mvcConnect({
            wallet: _wallet as MetaletWalletForMvc,
            network,
          });
    const _walletParams = {
      address: _wallet.address,
      pub:
        (_wallet as IMetaletWalletForBtc).pub ||
        (_wallet as MetaletWalletForMvc).xpub,
    };
    sessionStorage.setItem("walletParams", JSON.stringify(_walletParams));
    setInitializing(true);
    if (chain === "mvc") {
      setMvcConnector(connector as IMvcConnector);
      setBtcConnector(
        await btcConnect({
          network: network,
        })
      );
    } else {
      setBtcConnector(connector as IBtcConnector);
    }

    setIsLogin(true);
    setUser({
      avater: connector.user.avatar
        ? `${getHostByNet(network)}${connector.user.avatar}`
        : "",
      background: connector.user.background
        ? `${getHostByNet(network)}${connector.user.background}`
        : "",
      name: connector.user.name,
      metaid: connector.user.metaid,
      notice: 0,
      address: connector.wallet.address,
    });
    setChain(chain);
    localStorage.setItem("show_chain", chain);
    setInitializing(false);
  };

  const disConnect = async () => {
    setIsLogin(false);
    setBtcConnector(undefined);
  };
  useEffect(() => {
    const handleAccountChange = (newAccount: any) => {
      disConnect();
    };
    const handleNetChange = (network: string) => {
      disConnect();
    };
    if (window.metaidwallet && isLogin) {
      window.metaidwallet.on("accountsChanged", handleAccountChange);
      window.metaidwallet.on("networkChanged", handleNetChange);
    }

    return () => {
      if (window.metaidwallet && isLogin) {
        window.metaidwallet.removeListener(
          "accountsChanged",
          handleAccountChange
        );
        window.metaidwallet.removeListener("networkChanged", handleNetChange);
      }
    };
  }, [isLogin]);

  const init = useCallback(async () => {
    if (window.metaidwallet) {
      const _network = (await window.metaidwallet.getNetwork()).network;
      if (_network !== curNetwork) {
        disConnect();
        setInitializing(false);
        return;
      }
      setNetwork(_network);
      const walletParams = sessionStorage.getItem("walletParams");
      const _chain = localStorage.getItem("show_chain") || "btc";
      if (walletParams) {
        const _walletParams = JSON.parse(walletParams);
        const _wallet =
          _chain === "btc"
            ? MetaletWalletForBtc.restore({
                ..._walletParams,
                internal: window.metaidwallet,
              })
            : MetaletWalletForMvc.restore({
                address: _walletParams.address,
                xpub: _walletParams.pub,
              });
        const btcAddress =
          _chain === "btc"
            ? await window.metaidwallet.btc.getAddress()
            : await window.metaidwallet.getAddress();
        if (btcAddress !== _walletParams.address) {
          disConnect();
          setInitializing(false);
          return;
        }
        let connector: IBtcConnector | IMvcConnector | undefined = undefined;
        if (_chain === "btc") {
          connector = await btcConnect({
            wallet: _wallet as IMetaletWalletForBtc,
            network: _network,
          });
          setBtcConnector(connector);
        } else {
          connector = await mvcConnect({
            wallet: _wallet as MetaletWalletForMvc,
            network: _network,
          });
          setMvcConnector(connector);

          setBtcConnector(
            await btcConnect({
              network: _network,
            })
          );
        }
        setIsLogin(true);
        setUser({
          avater: connector.user.avatar
            ? `${getHostByNet(network)}${connector.user.avatar}`
            : "",
          background: connector.user.background
            ? `${getHostByNet(network)}${connector.user.background}`
            : "",
          name: connector.user.name,
          metaid: connector.user.metaid,
          notice: 0,
          address: connector.wallet.address,
        });
        setInitializing(false);
      }
    }
    setInitializing(false);
  }, []);

  const fetchUserInfo = useCallback(async () => {
    const userInfo = await btcConnector!.getUser({
      network: curNetwork,
      currentAddress: user.address,
    });
    setUser({
      avater: userInfo.avatar
        ? `${getHostByNet(network)}${userInfo.avatar}`
        : "",
      background: userInfo.background
        ? `${getHostByNet(network)}${userInfo.background}`
        : "",
      name: userInfo.name,
      metaid: userInfo.metaid,
      notice: 0,
      address: userInfo.address,
    });
  }, [btcConnector, user]);
  useEffect(() => {
    //
    setTimeout(() => {
      init();
    }, 500);
  }, [init]);

  const fetchFeeRateData = useCallback(async () => {
    const feeRateData = await fetchFeeRate({ netWork: curNetwork });
    setFeeRate(feeRateData?.fastestFee);
  }, []);
  const updateFeeRate = useIntervalAsync(fetchFeeRateData, 60000);

  const fetchUserFollowingList = useCallback(async () => {
    if (user.metaid) {
      const res = await fetchFollowingList({
        metaid: user.metaid ?? "",
        params: { cursor: "0", size: "100", followDetail: false },
      });
      console.log("fetchFollowingList", res);
      setFollowList(
        res && res.list ? res?.list.map((item: string) => item) : []
      );
    }
  }, [user.metaid]);

  useEffect(() => {
    fetchUserFollowingList();
  }, [fetchUserFollowingList]);

  return {
    isLogin,
    setIsLogin,
    user,
    connect,
    disConnect,
    initializing,
    btcConnector,
    chain,
    feeRate,
    setFeeRate,
    showConnect,
    setShowConnect,
    mvcConnector,
    followList,
    setFollowList,
    fetchUserInfo,
  };
};
