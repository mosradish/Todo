import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register =({ onRegister, setError }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:5000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                onRegister(data.token); // 親コンポーネントにトークンを渡す（自動ログイン）
                navigate("/");
            } else {
                setError(`登録失敗: ${data.message}`);
            }
        } catch (error) {
            setError("ネットワークエラーが発生しました");
        }
    };

    return (
        <div className="app_container">
            <h2 className="title">新規登録</h2>
            <form className="register_form" onSubmit={handleSubmit}>

                <label htmlFor="name">お名前</label>
                <input type="name" placeholder="お名前" value={name} onChange={(e) => setName(e.target.value)} required />

                <label htmlFor="email">メールアドレス</label>
                <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label htmlFor="name">パスワード</label>
                <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <button type="submit">登録</button>
            </form>
        </div>
    );
};

export default Register;