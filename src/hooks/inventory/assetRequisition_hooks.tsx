import { useEffect, useState } from "react";
import { fetchAllAssetReq } from "../../services/inventory/assetRequisition_services";

export const getAssetRequisition = () => {
    const [assets, setAssets] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllAssets = async () => {
        try{
            setLoading(true);
            const data = await fetchAllAssetReq();
            setAssets(data);
        }
        catch(error){
            console.error("Failed to fetch assets:", error);
            setError("Failed to fetch assets!")
        }finally{
            setLoading(false)
        }
    };
    useEffect(() =>{
        fetchAllAssets();
    }, [])

    return { assets, loading, error, refetch: fetchAllAssets }
}