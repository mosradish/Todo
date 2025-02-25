// Header.js
import React, { useEffect, useState } from "react";
import './Header.css';

const Header = () => {

    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/user", {
            credentials: "include", // Cookieを送信するための設定
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Not logged in");
                }
                return response.json();
            })
            .then((data) => setUser(data))
            .catch(() => setUser(null));
    }, []);

    return (
        <header>
            <h1 class="header_title">タスク管理</h1>
            <div className="nav_wrapper">
                <nav>
                    <ul class="title_nav">
                        <li><a href="/">Home</a></li>
                        <li><a href="/register">新規登録</a></li>
                        {user ? (
                            <li><a href="/logout">ログアウト</a></li>
                        ) : (
                            <li><a href="/login">ログイン</a></li>
                        )}
                    </ul>
                    {user ? (
                        <div className="user_info">
                            <p>ようこそ、{user.name}さん！</p>
                        </div>
                    ) : null
                    }
                </nav>
            </div>
        </header>
    );
}

export default Header;
