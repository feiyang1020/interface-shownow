
import { useModel } from "umi"
import Popup from "../ResponPopup"
import UserInfo from "../UserInfo"
import { Button, Card, Divider, GetProp, Input, InputNumber, message, Space, Upload, UploadFile, UploadProps } from "antd";
import { CloseOutlined, FileImageOutlined, LockOutlined, UnlockOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useState } from "react";
import { AttachmentItem, convertToFileList, image2Attach } from "@/utils/file";
import { CreateOptions, IBtcEntity, IMvcEntity, MvcTransaction } from "@metaid/metaid";
import { isEmpty, isNil } from "ramda";
import { curNetwork, FLAG } from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import BuzzCard from "../Cards/BuzzCard";
import Buzz from "../Buzz";
import _btc from '@/assets/btc.png'
import _mvc from '@/assets/mvc.png'
import { InscribeData } from "node_modules/@metaid/metaid/dist/core/entity/btc";
import * as crypto from 'crypto'
import { encryptPayloadAES, generateAESKey } from "@/utils/utils";
import { postPayBuzz } from "@/utils/buzz";
import { IBtcConnector } from "metaid/dist";
const { TextArea } = Input;
type Props = {
    show: boolean,
    onClose: () => void
    quotePin?: API.Pin;
}
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};
export default ({ show, onClose, quotePin }: Props) => {
    const isQuoted = !isNil(quotePin);
    const { user, btcConnector, feeRate, chain, mvcConnector } = useModel('user')
    const { showConf, fetchServiceFee, manPubKey } = useModel('dashboard')
    const [images, setImages] = useState<any[]>([]);
    const [content, setContent] = useState('');
    const [encryptContent, setEncryptContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const queryClient = useQueryClient();
    const [lock, setLock] = useState(false);
    const [payAmount, setPayAmount] = useState(0.00001);
    const [encryptFiles, setEncryptFiles] = useState<string[]>([]);

    const handleBeforeUpload = (file: any) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image file!');
            return Upload.LIST_IGNORE;
        }


        const previewUrl = URL.createObjectURL(file);
        setImages((prevImages) => [...prevImages, { file, previewUrl }]);
        return false;
    };
    const handleRemoveImage = (index: number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };
    const onCreateSubmit = async () => {
        const _images =
            images.length !== 0 ? await image2Attach(convertToFileList(images)) : [];
        if (lock) {
            handleAddBuzzWhthLock()
        } else {
            await handleAddBuzz({
                content: content,
                images: _images,
            });
        }

    };

    const handleAddBuzz = async (buzz: {
        content: string;
        images: AttachmentItem[];
    }) => {
        setIsAdding(true);
        const buzzEntity: IBtcEntity = await btcConnector!.use('buzz');
        let fileTransactions: MvcTransaction[] = []
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const finalBody: any = {
                content: buzz.content,
                contentType: 'text/plain',
            };
            if (!isEmpty(buzz.images)) {
                const fileOptions: CreateOptions[] = [];
                for (const image of buzz.images) {
                    fileOptions.push({
                        body: Buffer.from(image.data, 'hex').toString('base64'),
                        contentType: `${image.fileType};binary`,
                        encoding: 'base64',
                        flag: FLAG,
                        path: `${showConf?.host || ''}/file`
                    });
                }
                if (chain === 'btc') {
                    const fileEntity = await btcConnector!.use('file');
                    const imageRes = await fileEntity.create({
                        dataArray: fileOptions,
                        options: {
                            noBroadcast: 'no',
                            feeRate: Number(feeRate),
                        },
                    });

                    console.log('imageRes', imageRes);
                    finalBody.attachments = imageRes.revealTxIds.map(
                        (rid) => 'metafile://' + rid + 'i0'
                    );
                } else {
                    const fileEntity = (await mvcConnector!.use('file')) as IMvcEntity
                    const finalAttachMetafileUri: string[] = []

                    for (let i = 0; i < fileOptions.length; i++) {
                        const fileOption = fileOptions[i]
                        const { transactions } = await fileEntity.create({
                            data: fileOption,
                            options: {
                                network: curNetwork,
                                signMessage: 'upload image file',
                                serialAction: 'combo',
                                transactions: fileTransactions,
                            },
                        })

                        if (!transactions) {
                            throw new Error('upload image file failed')
                        }

                        finalAttachMetafileUri.push(
                            'metafile://' +
                            transactions[transactions.length - 1].txComposer.getTxId() +
                            'i0',
                        )
                        fileTransactions = transactions
                    }

                    finalBody.attachments = finalAttachMetafileUri
                }

            }
            //   await sleep(5000);

            console.log('finalBody', finalBody);
            if (!isNil(quotePin)) {
                finalBody.quotePin = quotePin.id;
            }
            if (chain === 'btc') {
                console.log('finalBody', {
                    body: JSON.stringify(finalBody),
                    contentType: 'text/plain;utf-8',
                    flag: FLAG,
                    path: `${showConf?.host || ''}/protocols/simplebuzz`
                });
                const createRes = await buzzEntity!.create({
                    dataArray: [
                        {
                            body: JSON.stringify(finalBody),
                            contentType: 'text/plain;utf-8',
                            flag: FLAG,
                            path: `${showConf?.host || ''}/protocols/simplebuzz`
                        },
                    ],
                    options: {
                        noBroadcast: 'no',
                        feeRate: Number(feeRate),
                        service: fetchServiceFee('post_service_fee_amount'),
                        // service: {
                        //     address: environment.service_address,
                        //     satoshis: environment.service_staoshi,
                        // },
                        // network: environment.network,
                    },
                });
                console.log('create res for inscribe', createRes);
                if (!isNil(createRes?.revealTxIds[0])) {
                    // await sleep(5000);
                    queryClient.invalidateQueries({ queryKey: ['buzzes'] });
                    message.success(`${isQuoted ? 'repost' : 'create'} buzz successfully`);
                    setContent('');
                    setImages([]);
                    onClose();
                }
            } else {
                const buzzEntity = (await mvcConnector!.use('buzz')) as IMvcEntity
                const createRes = await buzzEntity!.create({
                    data: { body: JSON.stringify({ ...finalBody, path: `${showConf?.host || ''}/protocols/simplebuzz` }) },
                    options: {
                        network: curNetwork,
                        signMessage: 'create buzz',
                        serialAction: 'finish',
                        transactions: fileTransactions,
                    },
                })
                console.log('create res for inscribe', createRes)
                if (!isNil(createRes?.txid)) {
                    // await sleep(5000);
                    queryClient.invalidateQueries({ queryKey: ['buzzes'] })
                    message.success(`${isQuoted ? 'repost' : 'create'} buzz successfully`)
                    setContent('')
                    setImages([])
                    onClose()
                }
            }

        } catch (error) {
            console.log('error', error);
            const errorMessage = (error as any)?.message ?? error;
            const toastMessage = errorMessage?.includes(
                'Cannot read properties of undefined'
            )
                ? 'User Canceled'
                : errorMessage;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error(toastMessage);
            setIsAdding(false);
        }
        setIsAdding(false);
    };
    const handleAddBuzzWhthLock = async () => {
        setIsAdding(true);
        try {
            const encryptImages = images.filter((image) => encryptFiles.includes(image.previewUrl));
            const publicImages = images.filter((image) => !encryptFiles.includes(image.previewUrl));
            if (encryptImages.length === 0 && !encryptContent) {
                throw new Error('Please input encrypt content or encrypt images')
            }
            await postPayBuzz({
                content: content,
                encryptImages: await image2Attach(convertToFileList(encryptImages)),
                publicImages: await image2Attach(convertToFileList(publicImages)),
                encryptContent: encryptContent,
            },
                String(payAmount),
                user.address,
                feeRate,
                showConf?.host || '',
                chain,
                btcConnector,
                mvcConnector!,
                manPubKey || '',
                fetchServiceFee('post_service_fee_amount'),
            )
            setContent('')
            setImages([])
            onClose()

        } catch (error) {
            console.log('error', error);
            const errorMessage = (error as any)?.message ?? error;
            const toastMessage = errorMessage?.includes(
                'Cannot read properties of undefined'
            )
                ? 'User Canceled'
                : errorMessage;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message.error(toastMessage);

        }
        setIsAdding(false);
    }
    return <Popup onClose={onClose} show={show} modalWidth={640} closable title={!isQuoted ? 'New Tweet' : 'Repost'}>
        {
            isQuoted && <Card style={{ margin: 24 }} styles={{
                body: {
                    padding: 0
                }
            }}><Buzz buzzItem={quotePin} showActions={false} /></Card>
        }
        <div>
            <UserInfo user={user} />
            <TextArea rows={4} placeholder={isQuoted ? 'Add a comment' : "What is happening？"} style={{ marginTop: 24 }} value={content} onChange={(e) => setContent(e.target.value)} />
            {
                lock && <TextArea rows={4} placeholder={"encrypt Content"} style={{ marginTop: 24 }} value={encryptContent} onChange={(e) => setEncryptContent(e.target.value)} />
            }

            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 16 }}>
                {images.map((image, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'relative',
                            marginRight: 8,
                            marginBottom: 8,
                            width: 100,
                            height: 100,
                        }}
                    >
                        <img
                            src={image.previewUrl}
                            alt={`preview-${index}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Button
                            onClick={() => handleRemoveImage(index)}
                            size="small"
                            style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                            }}
                            icon={<CloseOutlined />}
                        >
                        </Button>

                        <Button
                            onClick={() => {
                                console.log('encryptFiles', encryptFiles);
                                if (encryptFiles.includes(image.previewUrl)) {
                                    setEncryptFiles(encryptFiles.filter(item => item !== image.previewUrl))
                                } else {
                                    setEncryptFiles([...encryptFiles, image.previewUrl])
                                }
                            }}
                            size="small"
                            style={{
                                position: 'absolute',
                                bottom: 4,
                                right: 4,
                            }}
                            icon={
                                !encryptFiles.includes(image.previewUrl) ?
                                    <UnlockOutlined style={{ color: showConf?.brandColor }} /> :
                                    <LockOutlined style={{ color: showConf?.brandColor }} />}
                        >
                        </Button>
                    </div>
                ))}
            </div>
            {
                !isQuoted && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <Button type='text' icon={
                        !lock ? <UnlockOutlined style={{ color: showConf?.brandColor }} /> : <LockOutlined style={{ color: showConf?.brandColor }} />
                    } onClick={() => setLock(!lock)} />
                    {
                        lock && <InputNumber variant='filled' value={payAmount} onChange={() => {
                            setPayAmount(payAmount)
                        }} style={{ flexGrow: 1 }} suffix={<img src={_btc} style={{ height: 20, width: 20 }}></img>} />
                    }
                </div>
            }

            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                    <Upload beforeUpload={handleBeforeUpload}
                        showUploadList={false}  >
                        <Button icon={<FileImageOutlined style={{ color: showConf?.brandColor }} />} type='text'></Button>
                    </Upload>
                    <Button disabled icon={<VideoCameraOutlined style={{ color: showConf?.brandColor }} />} type='text'></Button>

                </Space>
                <Button shape='round' style={{ background: showConf?.gradientColor, color: '#fff' }} onClick={onCreateSubmit}>
                    Post
                </Button>
            </div>
        </div>
    </Popup>
}