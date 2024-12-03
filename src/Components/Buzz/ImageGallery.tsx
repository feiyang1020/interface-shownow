import { BASE_MAN_URL, FallbackImage } from "@/config";
import { LockOutlined } from "@ant-design/icons";
import { Image } from "antd";
import { useMemo } from "react";
import './imageGallery.less'

type Props = {
    decryptContent: {
        publicContent: string;
        encryptContent: string;
        publicFiles: string[];
        encryptFiles: string[];
        buzzType: "normal" | "pay";
        status: API.PayStatus;
    }
}
export default ({ decryptContent }: Props) => {
    const imageCount = useMemo(() => {
        return decryptContent?.publicFiles.length + decryptContent?.encryptFiles.length;
    }, [decryptContent]);

    // 根据图片数量设置不同的样式类
    const getGridClass = (count: number) => {
        switch (count) {
            case 1:
                return 'one-images';
            case 2:
                return 'two-images';
            case 3:
                return 'three-images';
            case 4:
                return 'four-images';
            case 5:
                return 'five-images';
            case 6:
                return 'six-images';
            case 7:
                return 'seven-images';
            case 8:
                return 'eight-images';
            case 9:
                return 'nine-images';
            default:
                return 'nine-images'; // 超过 9 张图则不显示更多
        }
    };

    return (
        <div onClick={e => { e.stopPropagation() }} style={{ marginBottom: 12, marginTop: 12 }} className={`image-container ${getGridClass(imageCount)}`}>
            <Image.PreviewGroup
                preview={{
                    onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
                }}

            >
                {
                    decryptContent?.publicFiles.map((pid: string, index) => {
                        return <Image
                            key={pid}
                            style={{ objectFit: 'cover', height: '100%', display: index > 8 ? 'none' : 'block' }}
                            src={`${BASE_MAN_URL}/content/${pid.replace('metafile://', '')}`}
                            fallback={FallbackImage}
                            className="image-item"
                        />
                    })
                }
                {
                    decryptContent.status === 'purchased' ? decryptContent?.encryptFiles.map((pid: string, index) => {
                        return <Image
                            key={pid}

                            style={{ objectFit: 'cover', height: '100%', display: decryptContent?.publicFiles.length + index > 8 ? 'none' : 'block' }}
                            src={`data:image/jpeg;base64,${pid}`}
                            fallback={FallbackImage}
                        />
                    }) :
                        decryptContent?.encryptFiles
                            .map((pid: string, index) => {
                                return <div key={pid} style={{ minHeight: 120, background: '#f5f5f5', height: '100%', display: decryptContent?.publicFiles.length + index > 8 ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
                                    <LockOutlined style={{ fontSize: 24 }} />
                                </div>
                            }
                            )
                }




            </Image.PreviewGroup>
        </div>
    );
};
