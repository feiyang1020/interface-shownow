import { getMetaidByAddress, getPubKey } from "@/request/api";
import { fetchShowConf } from "@/request/dashboard";
import { useCallback, useEffect, useState } from "react";

export default () => {
  const [loading, setLoading] = useState(true);
  const [showConf, setShowConf] = useState<DB.ShowConfDto>();
  const [manPubKey, setManPubKey] = useState<string>();
  const fetchConfig = useCallback(async () => {
    const ret = await fetchShowConf();
    if (true) {
      const userInfo = await getMetaidByAddress({
        address: "n18EnQDAEh47fYQbLJdzt6xdw8TvUs7haL", //ret.service_fee_address,
      });
      console.log(userInfo, "n18EnQDAEh47fYQbLJdzt6xdw8TvUs7haL");
      ret.host = userInfo!.metaid.slice(0, 16) + ":";
      console.log(ret.host, "ret.host");
    }
    setShowConf(ret);
    setLoading(false);
  }, []);
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);
  const fetchManPubKey = useCallback(async () => {
    const ret = await getPubKey();
    setManPubKey(ret);
  }, []);
  useEffect(() => {
    fetchManPubKey();
  }, [fetchManPubKey]);

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
    manPubKey
  };
};
