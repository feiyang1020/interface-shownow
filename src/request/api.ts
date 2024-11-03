import { BASE_MAN_URL } from "@/config";
import { IBtcConnector } from "@metaid/metaid";
import axios from "axios";
export type BtcNetwork = "mainnet" | "testnet" | "regtest";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const getIndexTweet = async () => {
  await sleep(1000);
  return {
    code: 0,
    data: {
      list: [
        {
          id: 1,
          content:
            "Loneliness is the norm, so you don't have to talk about it when you meet people!",
          images: [],
          user: {
            name: "zhangsan",
            avatar:
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            metaid: "001",
          },
        },
        {
          id: 2,
          content:
            "Loneliness is the norm, so you don't have to talk about it when you meet people!",
          user: {
            name: "zhangsan",
            avatar:
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            metaid: "001",
          },
        },
        {
          id: 3,
          content:
            "Loneliness is the norm, so you don't have to talk about it when you meet people!",
          user: {
            name: "zhangsan",
            avatar:
              "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            metaid: "001",
          },
        },
      ],
    },
  };
};

export async function fetchBuzzs({
  btcConnector,
  page,
  limit,
  network,
  path,
  address,
}: {
  btcConnector: IBtcConnector;
  page: number;
  limit: number;
  network: BtcNetwork;
  path?: string[];
  address?: string;
}): Promise<API.Pin[] | null> {
  const response = await btcConnector.getAllpin({
    page,
    limit,
    network,
    path,
    address,
  });
  console.log(response, "response");
  return response;
}

export async function fetchCurrentBuzzComments({
  pinId,
}: {
  pinId: string;
}): Promise<API.CommentRes[] | null> {
  const body = {
    collection: "paycomment",
    action: "get",
    filterRelation: "and",
    field: [],
    filter: [
      {
        operator: "=",
        key: "commentTo",
        value: pinId,
      },
    ],
    cursor: 0,
    limit: 99999,
    sort: ["number", "desc"],
  };

  try {
    const data = await axios
      .post(`${BASE_MAN_URL}/api/generalQuery`, body)
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function fetchCurrentBuzzLikes({
  pinId,
}: {
  pinId: string;
}): Promise<API.LikeRes[] | null> {
  const body = {
    collection: "paylike",
    action: "get",
    filterRelation: "and",
    field: [],
    filter: [
      {
        operator: "=",
        key: "likeTo",
        value: pinId,
      },
    ],
    cursor: 0,
    limit: 99999,
    sort: [],
  };

  try {
    const data = await axios
      .post(`${BASE_MAN_URL}/api/generalQuery`, body)
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchFollowDetailPin(params: {
  metaId: string;
  followerMetaId: string;
}): Promise<{
  metaId: string;
  followMetaId: string;
  followTime: number;
  followPinId: string;
  unFollowPinId: string;
  status: boolean;
}> {
  try {
    const data = await axios
      .get(`${BASE_MAN_URL}/api/follow/record`, { params })
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchFollowingList({
  metaid,
  params,
}: {
  metaid: string;
  params: {
    cursor: string;
    size: string;
    followDetail: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<{ list: any; total: number }> {
  try {
    const data = await axios
      .get(`${BASE_MAN_URL}/api/metaid/followingList/${metaid}`, {
        params,
      })
      .then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function getPinDetailByPid({
  pid,
}: {
  pid: string;
}): Promise<API.Pin | undefined> {
  const url = `${BASE_MAN_URL}/api/pin/${pid}`;

  try {
    const data = await axios.get(url).then((res) => res.data);
    return data.data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function fetchMyFollowingTotal(params: {
  page: number;
  size: number;
  path: string;
  metaidList: string[];
}): Promise<number | null> {
  const url = `${BASE_MAN_URL}/api/getAllPinByPathAndMetaId`;

  try {
    const data = await axios.post(url, params).then((res) => res.data);
    return data.data.total;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchMyFollowingBuzzsWithTotal(params: {
  page: number;
  size: number;
  path: string;
  metaidList: string[];
}): Promise<{ total: number; currentPage: API.Pin[] } | null> {
  const url = `${BASE_MAN_URL}/api/getAllPinByPathAndMetaId`;

  try {
    const data = await axios.post(url, params).then((res) => res.data);
    return { total: data.data.total, currentPage: data.data.list };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchMyFollowingBuzzs(params: {
  page: number;
  size: number;
  path: string;
  metaidList: string[];
}): Promise<API.Pin[] | null> {
  const url = `${BASE_MAN_URL}/api/getAllPinByPathAndMetaId`;

  try {
    const data = await axios.post(url, params).then((res) => res.data);
    return data.data.list;
  } catch (error) {
    console.error(error);
    return null;
  }
}