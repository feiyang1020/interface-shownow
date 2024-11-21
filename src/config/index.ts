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

export const curNetwork: API.Network = "mainnet";
// window.METAID_MARKET_NETWORK || "testnet";

// export const DASHBOARD_API = "https://testnet.show.now/api";
export const DASHBOARD_API =
  window.BUILD_ENV === "docker" ? "/api" : "https://www.show.now/api";
// export const DASHBOARD_API = "/api";
export const DASHBOARD_TOKEN = "DASHBOARD_TOKEN";
export const BASE_MAN_URL =
  window.BUILD_ENV === "docker" ? "/man" : "https://www.show.now/man";
// export const BASE_MAN_URL = "http://127.0.0.1:3000/man";
// export const BASE_MAN_URL = "/man";
export const FLAG = "metaid";
