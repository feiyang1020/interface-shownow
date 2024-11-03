declare namespace API {
  type Network = "testnet" | "mainnet";
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
}
