const TESTNET_CONTENT_HOST = "https://man-test.metaid.io";
const MAINNET_CONTENT_HOST = "https://man.metaid.io";
export const TESTNET_PIN_FEE_ADDRESS =
  "tb1pf4gj2uyjfytzzx3h06m977tvw6pl6hgy6kmgyle2757pcrrukr8sac4r7m";
export const MAINNET_PIN_FEE_ADDRESS =
  "bc1pf4gj2uyjfytzzx3h06m977tvw6pl6hgy6kmgyle2757pcrrukr8s2srvy5";
export const MAINNET_PIN_FEE_AMOUNT = "1999";
export const TESTNET_PIN_FEE_AMOUNT = "1999";
export const getHostByNet = (network: API.Network) => {
  if (network === "testnet") return TESTNET_CONTENT_HOST;
  return MAINNET_CONTENT_HOST;
};


const TESTNET_METAID_URL = "https://metaid-testnet.vercel.app/metaid-detail/";
const MAINNET_METAID_URL = "https://metaid.io/metaid-detail/";

export const curNetwork: API.Network =
  window.METAID_MARKET_NETWORK || "testnet";



export const getMetaIdUrlByNet = (network: API.Network): string => {
  if (network === "testnet") return TESTNET_METAID_URL;
  return MAINNET_METAID_URL;
};

export const DASHBOARD_API = "http://127.0.0.1:3000/api";
// export const DASHBOARD_API = "/api";
export const DASHBOARD_TOKEN = "DASHBOARD_TOKEN";
export const BASE_MAN_URL = "https://man-test.metaid.io";
export const FLAG = "metaid";
