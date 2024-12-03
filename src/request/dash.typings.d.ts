declare namespace DB {
  type ShowConfDto = {
    alias: string;
    brandColor: string;
    gradientColor: string;
    showRecommend: boolean;
    showSliderMenu: boolean;
    theme: "light" | "dark";
    colorBgLayout: string;
    contentSize: number;
    colorHeaderBg: string;
    colorBorderSecondary: string;
    colorButton: string;
    logo: string;
    twitterUrl: string;
    brandIntroMainTitle: string;
    brandIntroSubTitle: string;
    homeBackgroundImage: string;
    host: string;
    service_fee_address: string;
    follow_service_fee_amount: number;
    post_service_fee_amount: number;
    comment_service_fee_amount: number;
    like_service_fee_amount: number;
  };
}
