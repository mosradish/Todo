import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setErrorMessage, setUser }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
    
        try {
            const response = await fetch("http://127.0.0.1:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
    
            const data = await response.json();
            console.log("レスポンスデータ:", data);  // デバッグ用
    
            if (response.ok) {
                console.log("ログイン成功:", data);
    
                // JWT トークンを保存
                localStorage.setItem("jwt_token", data.access_token);
    
                // ユーザー情報を保存
                const userData = { id: data.user.id, name: data.user.name };
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
    
                navigate("/", { state: { message: "ログインに成功しました" } });
            } else {
                setErrorMessage(`ログイン失敗: ${data.message}`);
            }
        } catch (error) {
            setErrorMessage(`エラー: ${error.message || String(error)}`);
        }
    };

    return (
        <div>
            <h2 className="title">ログイン</h2>
            <form className="login_form" onSubmit={handleSubmit}>
                <label htmlFor="email">メールアドレス</label>
                <input
                    type="email"
                    id="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="password">パスワード</label>
                <input
                    type="password"
                    id="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">ログイン</button>
            </form>
        </div>
    );
};

export default Login;
