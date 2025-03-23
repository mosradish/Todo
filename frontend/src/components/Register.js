import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = ({ setErrorMessage, setUser }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        try {
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
                credentials: 'include'
            });

            const data = await response.json();
            console.log("登録レスポンス:", data);

            if (response.ok) {
                console.log("登録成功:", data);

                // JWT トークンを保存
                localStorage.setItem("jwt_token", data.access_token);

                // ユーザー情報を保存
                const userData = { id: data.user.id, name: data.user.name };
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);

                navigate("/", { state: { message: "登録 & ログイン成功" } });
            } else {
                setErrorMessage(`登録失敗: ${data.message}`);
            }
        } catch (error) {
            setErrorMessage(`エラー: ${error.message || String(error)}`);
        }
    };

    return (
        <div>
            <h2 className="title">新規登録</h2>
            <form className="register_form" onSubmit={handleSubmit}>
                <label htmlFor="name">名前</label>
                <input
                    type="text"
                    id="name"
                    placeholder="名前"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

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

                <button type="submit">新規登録</button>
            </form>
        </div>
    );
};

export default Register;
