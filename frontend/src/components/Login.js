import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setError, setUser }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const fetchUserData = async (token) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                credentials: "include",
            });
    
            if (response.ok) {
                const userData = await response.json();
    
                // JWT トークンをデコードして name を取得
                const payload = JSON.parse(atob(token.split(".")[1])); 
                userData.name = payload.name; // `name` を追加
    
                console.log("取得したユーザーデータ:", userData);
                // ローカルストレージに保存
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
            } else {
                console.error("ユーザーデータの取得に失敗");
            }
        } catch (error) {
            console.error("エラー:", error);
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("jwt_token", data.token);
                await fetchUserData(data.token); // ユーザー情報を取得
                navigate("/");
            } else {
                setError(`ログイン失敗: ${data.message}`);
            }
        } catch (error) {
            setError(`エラー: ${error.message || String(error)}`);
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