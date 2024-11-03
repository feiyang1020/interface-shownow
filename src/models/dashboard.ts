import { fetchShowConf } from "@/request/dashboard";
import { useCallback, useEffect, useState } from "react";

export default () => {
  const [loading, setLoading] = useState(true);
  const [showConf, setShowConf] = useState<DB.ShowConfDto>();
  const fetchConfig = useCallback(async () => {
    const ret = await fetchShowConf();
    setShowConf(ret);
    setLoading(false);
  }, []);
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);
  return {
    loading,
    fetchConfig,
    showConf,
    setLoading,
  };
};
