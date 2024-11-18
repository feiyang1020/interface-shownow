import {
  CreateOptions,
  IMvcConnector,
  IMvcEntity,
  MvcTransaction,
} from "@metaid/metaid";
import { AttachmentItem } from "./file";
import {
  decryptPayloadAES,
  encryptPayloadAES,
  generateAESKey,
  sha256sum,
} from "./utils";
import { curNetwork, FLAG } from "@/config";
import { IBtcConnector } from "metaid/dist";
import { InscribeData } from "metaid/src/core/entity/btc";
import Decimal from "decimal.js";
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import ECPairFactory, { ECPairInterface, SignerAsync } from "ecpair";
import * as bitcoin from "bitcoinjs-lib";
import { dec, isEmpty } from "ramda";
import {
  getControlByContentPin,
  getDecryptContent,
  getPinDetailByPid,
} from "@/request/api";
import * as crypto from "crypto";
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
type PostParams = {
  content: string;
  encryptImages: AttachmentItem[];
  publicImages: AttachmentItem[];
  encryptContent: string;
};
export const postPayBuzz = async (
  { content, encryptImages, publicImages, encryptContent }: PostParams,
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
  console.log(
    randomKey,
    "randomKey",
    Buffer.from(randomKey, "hex").toString("hex")
  );
  const publicContent = content;
  const _encryptContent = encryptContent
    ? encryptPayloadAES(
        randomKey,
        Buffer.from(encryptContent, "utf-8").toString("hex")
      )
    : "";
  const { attachments, fileTransactions } = await postImages(
    publicImages,
    feeRate,
    host,
    chain,
    btcConnector,
    mvcConnector
  );

  console.log(randomKey, "randomKey");
  console.log(encryptContent, "content.slice(250)");
  const {
    attachments: encryptAttachments,
    fileTransactions: encryptFileTransactions,
  } = await postEncryptImages(
    encryptImages,
    feeRate,
    host,
    chain,
    btcConnector,
    mvcConnector,
    randomKey
  );

  const payload = {
    publicContent,
    encryptContent: _encryptContent,
    contentType: "text/plain",
    publicFiles: attachments,
    encryptFiles: encryptAttachments,
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
      transactions: [...fileTransactions, ...encryptFileTransactions],
    });
    console.log(txid, "transactions");
    pid = `${txid}i0`;
  }

  const { sharedSecret, ecdhPubKey } = await window.metaidwallet.common.ecdh({
    externalPubKey: manPubKey,
  });

  const contorlPayload = {
    controlPins: [pid],
    manDomain: "",
    manPubkey: manPubKey,
    creatorPubkey: ecdhPubKey,
    encryptedKey: encryptPayloadAES(sharedSecret, randomKey),
    // holdCheck: {
    //   type: "chainCoin",
    //   ticker: "",
    //   amount: "",
    // },
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
      transactions: [],
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

export const postEncryptImages = async (
  images: AttachmentItem[],
  feeRate: number,
  host: string,
  chain: API.Chain,
  btcConnector: IBtcConnector | undefined,
  mvcConnector: IMvcConnector | undefined,
  randomKey: string
) => {
  if (images.length === 0)
    return {
      attachments: [],
      fileTransactions: [],
    };

  const fileOptions: CreateOptions[] = [];
  for (const image of images) {
    fileOptions.push({
      body: encryptPayloadAES(
        randomKey,
        Buffer.from(image.data, "hex").toString("hex")
      ),
      contentType: `binary`,
      encoding: "binary",
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
          transactions: fileTransactions,
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
  const res = await btcConnector!.inscribe({
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
  if (res.status) throw new Error(res.status);
};

function sha256ToHex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export const decodePayBuzz = async (
  buzzItem: API.Buzz,
  manPubKey: string,
  chain: API.Chain
): Promise<{
  publicContent: string;
  encryptContent: string;
  publicFiles: string[];
  encryptFiles: string[];
  buzzType: "normal" | "pay";
  status: API.PayStatus;
}> => {
  let _summary = buzzItem!.content;
  const isSummaryJson = _summary.startsWith("{") && _summary.endsWith("}");
  const parseSummary = isSummaryJson ? JSON.parse(_summary) : {};
  if (!isSummaryJson) {
    return {
      publicContent: _summary,
      encryptContent: "",
      publicFiles: [],
      encryptFiles: [],
      buzzType: "normal",
      status: "unpurchased",
    };
  }

  if (!isEmpty(parseSummary?.attachments ?? [])) {
    return {
      publicContent: parseSummary.content,
      encryptContent: "",
      publicFiles: (parseSummary?.attachments ?? []).map(
        (d: string) => d.split("metafile://")[1]
      ),
      encryptFiles: [],
    };
  }

  if (
    parseSummary.encryptContent ||
    !isEmpty(parseSummary?.encryptFiles ?? [])
  ) {
    const { data: controlPin } = await getControlByContentPin({
      pinId: buzzItem!.id,
    });
    if (!controlPin) {
      return {
        publicContent: parseSummary.publicContent,
        encryptContent: "",
        publicFiles: parseSummary.publicFiles,
        encryptFiles: [],
        buzzType: "normal",
        status: "unpurchased",
      };
    }
    // const { creatorPubkey, encryptedKey, manPubkey } = controlPin;
    const address =
      chain === "btc"
        ? await window.metaidwallet.btc.getAddress()
        : await window.metaidwallet.getAddress();
    const btcAddress = await window.metaidwallet.btc.getAddress();
    const mvcAddress = await window.metaidwallet.getAddress();
    console.log(address, buzzItem, "address");
    if (buzzItem.creator === btcAddress||buzzItem.creator === mvcAddress) {
      const { manPubkey, encryptedKey } = controlPin;
      const { sharedSecret, ecdhPubKey } =
        await window.metaidwallet.common.ecdh({
          externalPubKey: manPubKey,
        });
      const key = decryptPayloadAES(sharedSecret, encryptedKey);
      const encryptContent = decryptPayloadAES(
        key,
        parseSummary.encryptContent
      );
      const { encryptFiles } = parseSummary;
      let decryptFiles: string[] = [];
      if (encryptFiles.length > 0) {
        const pids = encryptFiles.map((d: string) => d.split("metafile://")[1]);
        const _pins = await Promise.all(
          pids.map((pid: string) => getPinDetailByPid({ pid }))
        );
        const pins = _pins.filter((d) => Boolean(d));
        decryptFiles = pins.map((pin) => {
          return Buffer.from(
            decryptPayloadAES(key, pin.contentSummary),
            "hex"
          ).toString("base64");
        });
      }

      return {
        publicContent: parseSummary.publicContent,
        encryptContent: Buffer.from(encryptContent, "hex").toString("utf-8"),
        publicFiles: parseSummary.publicFiles,
        encryptFiles: decryptFiles,
        buzzType: "pay",
        status: "purchased",
      };
    }

    const { sharedSecret, ecdhPubKey } = await window.metaidwallet.common.ecdh({
      externalPubKey: manPubKey,
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const _signStr = `${sharedSecret}${timestamp}${address}`;
    const sign = sha256ToHex(_signStr);
    const decryptRet = await getDecryptContent({
      publickey: ecdhPubKey,
      address: address,
      sign: sign,
      timestamp,
      pinId: buzzItem!.id,
      controlPath: "",
      controlPinId: controlPin.pinId,
    });
    const { data } = decryptRet;
    if (!data) {
      return {
        publicContent: parseSummary.publicContent,
        encryptContent: parseSummary.encryptContent,
        publicFiles: parseSummary.publicFiles,
        encryptFiles: parseSummary.encryptFiles,
        buzzType: "pay",
        status: "unpurchased",
      };
    }
    return {
      publicContent: parseSummary.publicContent,
      encryptContent:
        data.status === "purchased" ? data.contentResult || "" : "",
      publicFiles: parseSummary.publicFiles,
      encryptFiles:
        data.status === "purchased"
          ? data.filesResult || []
          : parseSummary.encryptFiles,
      buzzType: "pay",
      status: data.status,
    };
  }

  return {
    publicContent: parseSummary.content,
    encryptContent: "",
    publicFiles: [],
    encryptFiles: [],
    buzzType: "normal",
    status: "unpurchased",
  };
};
