import { useState, useCallback } from 'react';

const useServerConnection = () => {
    const [errorMessage, setErrorMessage] = useState(null);

    const checkServerConnection = useCallback(async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/health");
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