import { getMetaidByAddress } from "@/request/api";
import { fetchShowConf } from "@/request/dashboard";
import { useCallback, useEffect, useState } from "react";

export default () => {
  const [loading, setLoading] = useState(true);
  const [showConf, setShowConf] = useState<DB.ShowConfDto>();
  const fetchConfig = useCallback(async () => {
    const ret = await fetchShowConf();

    if (ret.service_fee_address) {
      const userInfo = await getMetaidByAddress({
        address: ret.service_fee_address,
      });
      ret.host = userInfo!.metaid.slice(0, 16);
    }
    setShowConf(ret);
    setLoading(false);
  }, []);
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const fetchServiceFee = (feeType: keyof DB.ShowConfDto) => {
    if (showConf && showConf["service_fee_address"] && showConf[feeType]) {
      return {
        address: showConf["service_fee_address"] as string,
        satoshis: String(showConf[feeType]) as string,
      };
    } else {
      return undefined;
    }
  };
  return {
    loading,
    fetchConfig,
    showConf,
    setLoading,
    fetchServiceFee,
  };
};
