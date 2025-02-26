import { useState } from "react";
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
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error("ユーザー情報の取得に失敗:", error);
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
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("jwt_token", data.token);
                await fetchUserData(data.token); // ユーザー情報を取得
                navigate("/");
            } else {
                setError(`ログイン失敗: ${data.message}`);
                navigate("/login");
            }
        } catch (error) {
            setError("エラー : " + error);
            navigate("/login");
        }
    };

    return (
        <div>
            <h2 className="title">ログイン</h2>
            <form className="login_form" onSubmit={handleSubmit}>
                <label htmlFor="email">メールアドレス</label>
                <input
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="name">パスワード</label>
                <input
                    type="password"
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