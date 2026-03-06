import { useEffect, useState } from "react";
import { fetchAllEquipment } from "../../services/inventory/equipmentInv_services";

export const getAllEquipment = () => {
    const [equipment, setEquipment] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllEquip = async () => {
        try{
            setLoading(true);
            const data = await fetchAllEquipment();
            setEquipment(data);
        }
        catch(error){
            console.error("Failed to fetch equipment:", error);
            setError("Failed to fetch equipment!")
        }finally{
            setLoading(false)
        }
    };
    useEffect(() =>{
        fetchAllEquip();
    }, [])

    return { equipment, loading, error, refetch: fetchAllEquip }
}