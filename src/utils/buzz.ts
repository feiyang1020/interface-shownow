import {
  CreateOptions,
  IMvcConnector,
  IMvcEntity,
  MvcTransaction,
} from "@metaid/metaid";
import { AttachmentItem } from "./file";
import { encryptPayloadAES, generateAESKey } from "./utils";
import { curNetwork, FLAG } from "@/config";
import { IBtcConnector } from "metaid/dist";
import { InscribeData } from "metaid/src/core/entity/btc";
import Decimal from "decimal.js";

type PostParams = {
  content: string;
  encryptImages: AttachmentItem[];
  publicImages: AttachmentItem[];
};
export const postPayBuzz = async (
  { content, encryptImages, publicImages }: PostParams,
  price: string,
  address: string,
  feeRate: number,
  host: string,
  chain: API.Chain,
  btcConnector: IBtcConnector | undefined,
  mvcConnector: IMvcConnector | undefined,
  manPubKey: string,
  serviceFee:
    | {
        address: string;
        satoshis: string;
      }
    | undefined
) => {
  const randomKey = generateAESKey();
  const publicContent = content.slice(0, 250);
  const encryptContent = content.slice(250)
    ? encryptPayloadAES(randomKey, content.slice(250))
    : "";
  const encryptFiles = encryptImages.map((image) => {
    return `metafile://${encryptPayloadAES(
      randomKey,
      Buffer.from(image.data, "hex").toString("base64")
    )}`;
  });
  const { attachments, fileTransactions } = await postImages(
    publicImages,
    feeRate,
    host,
    chain,
    btcConnector,
    mvcConnector
  );

  const payload = {
    publicContent,
    encryptContent,
    contentType: "text/plain",
    publicFiles: attachments,
    encryptFiles,
  };
  const path = `${host || ""}/protocols/paybuzz`;
  const metaidData: InscribeData = {
    operation: "create",
    body: JSON.stringify(payload),
    path,
    contentType: "text/plain",
    flag: "metaid",
  };

  let pid = "";
  if (chain === "btc") {
    const ret = await btcConnector!.inscribe({
      inscribeDataArray: [metaidData],
      options: {
        noBroadcast: "no",
        feeRate: Number(feeRate),
        service: serviceFee,
      },
    });
    if (ret.status) throw new Error(ret.status);
    const [revealTxId] = ret.revealTxIds;
    pid = `${revealTxId}i0`;
  } else {
    const { txid } = await mvcConnector!.createPin(metaidData, {
      network: curNetwork,
      signMessage: "create paybuzz",
      serialAction: "finish",
      transactions: fileTransactions,
    });
    console.log(txid, "transactions");
    pid = `${txid}i0`;
  }

  const { sharedSecret } = await window.metaidwallet.commons.ecdh({
    externalPubKey: manPubKey,
  });

  const contorlPayload = {
    controlPins: [pid],
    manDomain: "",
    manPubkey: manPubKey,
    creatorPubkey: await window.metaidwallet.btc.getPublicKey(),
    encryptedKey: encryptPayloadAES(sharedSecret, randomKey),
    holdCheck: {
      type: "chainCoin",
      ticker: "",
      amount: "",
    },
    payCheck: {
      type: "chainCoin", //"chainCoin" or "mrc20"
      ticker: "",
      amount: price,
      payTo: address,
    },
  };
  const contorlPath = `${host || ""}/metaaccess/accesscontrol`;
  const contorlMetaidData: InscribeData = {
    operation: "create",
    body: JSON.stringify(contorlPayload),
    path: contorlPath,
    contentType: "text/plain",
    flag: "metaid",
  };

  if (chain === "btc") {
    const ret = await btcConnector!.inscribe({
      inscribeDataArray: [contorlMetaidData],
      options: {
        noBroadcast: "no",
        feeRate: Number(feeRate),
        service: serviceFee,
      },
    });
    if (ret.status) throw new Error(ret.status);
  } else {
    await mvcConnector!.createPin(contorlMetaidData, {
      network: curNetwork,
      signMessage: "create accesscontrol",
      serialAction: "finish",
      transactions: fileTransactions,
    });
  }
};

export const postImages = async (
  images: AttachmentItem[],
  feeRate: number,
  host: string,
  chain: API.Chain,
  btcConnector: IBtcConnector | undefined,
  mvcConnector: IMvcConnector | undefined
) => {
  if (images.length === 0)
    return {
      attachments: [],
      fileTransactions: [],
    };

  const fileOptions: CreateOptions[] = [];
  for (const image of images) {
    fileOptions.push({
      body: Buffer.from(image.data, "hex").toString("base64"),
      contentType: `${image.fileType};binary`,
      encoding: "base64",
      flag: FLAG,
      path: `${host || ""}/file`,
    });
  }
  if (chain === "btc") {
    const fileEntity = await btcConnector!.use("file");
    const imageRes = await fileEntity.create({
      dataArray: fileOptions,
      options: {
        noBroadcast: "no",
        feeRate: Number(feeRate),
      },
    });
    return {
      attachments: imageRes.revealTxIds.map(
        (rid) => "metafile://" + rid + "i0"
      ),
      fileTransactions: [],
    };
  } else {
    let fileTransactions: MvcTransaction[] = [];
    const fileEntity = (await mvcConnector!.use("file")) as IMvcEntity;
    const finalAttachMetafileUri: string[] = [];

    for (let i = 0; i < fileOptions.length; i++) {
      const fileOption = fileOptions[i];
      const { transactions } = await fileEntity.create({
        data: fileOption,
        options: {
          network: curNetwork,
          signMessage: "upload image file",
          serialAction: "combo",
          transactions: [],
        },
      });

      if (!transactions) {
        throw new Error("upload image file failed");
      }

      finalAttachMetafileUri.push(
        "metafile://" +
          transactions[transactions.length - 1].txComposer.getTxId() +
          "i0"
      );
      fileTransactions = transactions;
    }

    return {
      fileTransactions,
      attachments: finalAttachMetafileUri,
    };
  }
};

export const buildAccessPass = async (
  pid: string,
  host: string,
  btcConnector: IBtcConnector | undefined,
  feeRate: number,
  payAddress: string,
  payAmount: string
) => {
  //TODO
  const payload = {
    accessControlID: pid,
  };
  const path = `${host || ""}/metaaccess/accesspass`;
  const metaidData: InscribeData = {
    operation: "create",
    body: JSON.stringify(payload),
    path,
    contentType: "text/plain",
    flag: "metaid",
  };
  await btcConnector!.inscribe({
    inscribeDataArray: [metaidData],
    options: {
      noBroadcast: "no",
      feeRate: Number(feeRate),
      service: {
        address: payAddress, // payCheck.payTo
        satoshis: new Decimal(payAmount).mul(1e8).toString(), // payCheck.amount
      },
    },
  });
};
