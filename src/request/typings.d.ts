declare namespace API {
  type Network = "testnet" | "mainnet";
  type Chain = "btc" | "mvc";
  type Pin = {
    id: string;
    number: number;
    metaid: string;
    address: string;
    creator: string;
    initialOwner: string;
    output: string;
    outputValue: number;
    timestamp: number;
    genesisFee: number;
    genesisHeight: number;
    genesisTransaction: string;
    txInIndex: number;
    offset: number;
    location: string;
    operation: string;
    path: string;
    parentPath: string;
    originalPath: string;
    encryption: string;
    version: string;
    contentType: string;
    contentTypeDetect: string; // text/plain; charset=utf-8
    contentBody: any;
    contentLength: number;
    contentSummary: string;
    status: number;
    originalId: string;
    isTransfered: boolean;
    preview: string; // "https://man-test.metaid.io/pin/4988b001789b5dd76db60017ce85ccbb04a3f2aa825457aa948dc3c1e3b6e552i0";
    content: string; // "https://man-test.metaid.io/content/4988b001789b5dd76db60017ce85ccbb04a3f2aa825457aa948dc3c1e3b6e552i0";
    pop: string;
    popLv: number;
    chainName: string;
    dataValue: number;
  };
  type CommentRes = {
    _id: string;
    commentTo: string;
    content: string;
    pay: string;
    payTo: string;
    pinAddress: string;
    pinId: string;
    pinNumber: number;
    replyTo: string;
  };

  type LikeRes = {
    _id: string;
    isLike: string;
    likeTo: string;
    pinAddress: string;
    pinId: string;
    pinNumber: number;
  };

  type FeeRateApi = {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
  };

  type Buzz = {
    id: string;
    number: number;
    metaid: string;
    address: string;
    creator: string;
    createMetaId: string;
    initialOwner: string;
    output: string;
    outputValue: number;
    timestamp: number;
    genesisFee: number;
    genesisHeight: number;
    genesisTransaction: string;
    txIndex: number;
    txInIndex: number;
    offset: number;
    location: string;
    operation: string;
    path: string;
    parentPath: string;
    originalPath: string;
    encryption: string;
    version: string;
    contentType: string;
    contentTypeDetect: string;
    contentBody: any;
    contentLength: number;
    contentSummary: string;
    status: number;
    originalId: string;
    isTransfered: boolean;
    preview: string;
    content: string;
    pop: string;
    popLv: number;
    chainName: string;
    dataValue: number;
    mrc20MintId: any[];
    MogoID: string;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    hot: number;
  };

  type BuzzListRet = {
    code: number;
    message: string;
    data: {
      list: Buzz[];
      lastId: string;
    };
  };

  type BuzzDetailRet = {
    code: number;
    message: string;
    data: {
      tweet: Buzz;
      like: LikeRes;
      comment: CommentRes[];
    };
  };

  type AccessControl = {
    pinId: string;
    address: string;
    metaId: string;
    controlPins: string[];
    controlPath: string;
    manDomain: string;
    manPubkey: string;
    creatorPubkey: string;
    encryptedKey: string;
    holdCheck: {
      ticker: string;
      type: "mrc20";
      amount: string;
    };
    payCheck: {
      type: string;
      ticker: string;
      amount: string;
      payTo: string;
      validPeriod: string;
    };
  };
  type PayStatus = "purchased" | "unpurchased" | "mempool";
  type ControlByContentPinRet = {
    code: number;
    message: string;
    data: AccessControl;
  };

  type MRC20TickInfo = {
    amtPerMint: string;
    blockHeight: string;
    decimals: string;
    metadata: string;
    mintCount: string;
    mrc20Id: string;
    pinNumber: number;
    pinCheck: {
      count: string;
      lvl: string;
    };
    tick: string;
    tokenName: string;
    totalMinted: number;
    type: string;
    mintable: boolean;
  };
}
