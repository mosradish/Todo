import React, { useEffect, useState } from "react";
import './Header.css';

const Header = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");

        if (token) {
            fetch("http://127.0.0.1:5000/api/user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // スペースが正しく入っているか確認
                },
                credentials: 'include' // CORSでクッキーを送信するために必要
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Not logged in");
                }
                return response.json();
            })
            .then((data) => {
                setUser(data);
            })
            .catch((error) => {
                console.error("APIエラー:", error);
                setUser(null);
                localStorage.removeItem("jwt_token"); // トークンが無効な場合は削除
            });
        } else {
            setUser(null);
        }
    }, []);

    return (
        <header>
            <h1 className="header_title">タスク管理</h1>
            <div className="nav_wrapper">
                <nav>
                    <ul className="title_nav">
                        <li><a href="/">Home</a></li>
                        <li><a href="/register">新規登録</a></li>
                        {user ? (
                            <li><a href="/logout" onClick={() => localStorage.removeItem('jwt_token')}>ログアウト</a></li>
                        ) : (
                            <li><a href="/login">ログイン</a></li>
                        )}
                    </ul>
                    {user ? (
                        <div className="user_info">
                            <span className="bold">ようこそ、{user.name}さん！</span>
                        </div>
                    ) : null}
                </nav>
            </div>
        </header>
    );
}

export default Header;
