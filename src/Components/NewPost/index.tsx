
import { useModel } from "umi"
import Popup from "../ResponPopup"
import UserInfo from "../UserInfo"
import { Button, Card, Divider, GetProp, Input, message, Space, Upload, UploadFile, UploadProps } from "antd";
import { CloseOutlined, FileImageOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useState } from "react";
import { AttachmentItem, convertToFileList, image2Attach } from "@/utils/file";
import { CreateOptions, IBtcEntity, IMvcEntity, MvcTransaction } from "@metaid/metaid";
import { isEmpty, isNil } from "ramda";
import { curNetwork, FLAG } from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import BuzzCard from "../Cards/BuzzCard";
import Buzz from "../Buzz";
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
    const { showConf } = useModel('dashboard')
    const [images, setImages] = useState<any[]>([]);
    const [content, setContent] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const queryClient = useQueryClient();

    const handleBeforeUpload = (file: any) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image file!');
            return Upload.LIST_IGNORE;
        }

        // 使用 URL.createObjectURL 生成图片预览 URL
        const previewUrl = URL.createObjectURL(file);
        setImages((prevImages) => [...prevImages, { file, previewUrl }]);
        return false; // 阻止自动上传
    };
    const handleRemoveImage = (index: number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };
    const onCreateSubmit = async () => {
        // console.log('submit raw image', data.images);
        const _images =
            images.length !== 0 ? await image2Attach(convertToFileList(images)) : [];
        // console.log('submit process image',  images);
        console.log('submit process image', _images);
        await handleAddBuzz({
            content: content,
            images: _images,
        });
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
                    });
                }
                if (chain === 'btc') {
                    //TODO: add feeRate
                    const fileEntity = await btcConnector!.use('file');
                    const imageRes = await fileEntity.create({
                        dataArray: fileOptions,
                        options: {
                            noBroadcast: 'no',
                            feeRate: Number(feeRate),
                            // service: {
                            //     address: environment.service_address,
                            //     satoshis: environment.service_staoshi,
                            // },
                            // network: environment.network,
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
                const createRes = await buzzEntity!.create({
                    dataArray: [
                        {
                            body: JSON.stringify(finalBody),
                            contentType: 'text/plain;utf-8',
                            flag: FLAG,
                        },
                    ],
                    options: {
                        noBroadcast: 'no',
                        feeRate: Number(feeRate),
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
                    data: { body: JSON.stringify(finalBody) },
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
    return <Popup onClose={onClose} show={show} modalWidth={800} closable title={!isQuoted ? 'New Tweet' : 'Repost'}>
        {
            isQuoted && <Card style={{ margin: 24 }} styles={{body:{
                padding: 0
            }}}><Buzz buzzItem={quotePin} showActions={false} /></Card>
        }
        <div>
            <UserInfo user={user} />
            <TextArea rows={6} placeholder={isQuoted ? 'Add a comment' : "What is happening？"} style={{ marginTop: 24 }} value={content} onChange={(e) => setContent(e.target.value)} />
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
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                            }}
                            icon={<CloseOutlined />}
                        >
                        </Button>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                    <Upload beforeUpload={handleBeforeUpload}
                        showUploadList={false}  >
                        <Button icon={<FileImageOutlined style={{ color: showConf?.brandColor }} />} type='text'></Button>
                    </Upload>
                    <Button disabled icon={<VideoCameraOutlined style={{ color: showConf?.brandColor }} />} type='text'></Button>

                </Space>
                <Button shape='round' style={{ background: showConf?.gradientColor,color:'#fff' }} onClick={onCreateSubmit}>
                    Post
                </Button>
            </div>
        </div>
    </Popup>
}