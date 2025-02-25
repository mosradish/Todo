import { useState } from "react";

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
            onLogin(data.token); // 親コンポーネントにトークンを渡す
        } else {
            alert("ログイン失敗: " + data.message);
        }
    };

    return (
        <div>
            <h2 className="title">ログイン</h2>
            <form className="login_form" onSubmit={handleSubmit}>
                <label htmlFor="email">メールアドレス</label>
                <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} required />
                
                <label htmlFor="name">パスワード</label>
                <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} required />
                
                <button type="submit">ログイン</button>
            </form>
        </div>
    );
};

export default Login;