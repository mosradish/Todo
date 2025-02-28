import React, { useEffect, useState } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ setUser }) => {
    const [user, setLocalUser] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token"); // トークンを削除
        navigate("/login"); // ログイン画面へリダイレクト
    };

    useEffect(() => {
        // localStorage から user を取得して状態にセット
        const savedUser = JSON.parse(localStorage.getItem("user"));
        if (savedUser) {
            setLocalUser(savedUser);
        }
    }, []);

    return (
        <header>
            <h1 className="header_title">タスク管理</h1>
            <div className="nav_wrapper">
                <nav>
                <ul className="title_nav">
                    <li><Link to="/">タスク</Link></li>

                    {user ? (
                        <li><a href="#" onClick={handleLogout}>ログアウト</a></li>
                    ) : (
                        <>
                            <li><Link to="/register">新規登録</Link></li>
                            <li><Link to="/login">ログイン</Link></li>
                        </>
                    )}
                </ul>
                </nav>
            </div>
            {user && (
                <div className="user_info">
                    <span className="bold">ようこそ、{user.name}さん！</span>
                </div>
            )}
        </header>
    );
};

export default Header;