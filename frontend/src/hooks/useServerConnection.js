import { useState, useCallback } from 'react';
import { API_URL } from "../config";

const useServerConnection = () => {
    const [errorMessage, setErrorMessage] = useState(null);

    const checkServerConnection = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/health`);
            if (!response.ok) {
                throw new Error("サーバーに接続できません");
            }
        } catch (error) {
            setErrorMessage("サーバーに接続できませんでした。");
            return false;
        }
        return true;
    }, []);

    return {
        checkServerConnection,
        errorMessage
    };
};

export default useServerConnection;