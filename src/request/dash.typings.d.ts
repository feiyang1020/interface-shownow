declare namespace DB {
  type ShowConfDto = {
    alias: string;
    brandColor: string;
    gradientColor: string;
    showRecommend: boolean;
    showMenu: boolean;
    theme: 'light' | 'dark';
    colorBgLayout:string;
    logo: string;
    twitterUrl: string;
    host: string;
    service_fee_address: string;
    follow_service_fee_amount: number;
    post_service_fee_amount: number;
    comment_service_fee_amount: number;
    like_service_fee_amount: number;
  };
}
