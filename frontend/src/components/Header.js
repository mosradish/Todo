import React, { useEffect, useState } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ setUser }) => {
    const [user, setLocalUser] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        // localStorageからJWTトークンを削除
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user");
    
        // ユーザー状態をクリア
        setUser(null);
    
        // バックエンドにログアウト処理をリクエスト
        fetch('http://127.0.0.1:5000/logout', {
            method: 'POST', // 通常、ログアウトはPOSTリクエストで行う
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("jwt_token")}` // 必要に応じてトークンをヘッダーに追加
            },
            credentials: 'include' // サーバー側でセッションを無効にするために必要
        })
        .then(() => {
            // ログアウト後、ホームページに遷移
            navigate('/');
        })
        .catch(error => {
            console.error('ログアウトエラー:', error);
            // エラーが発生してもホームページに遷移
            navigate('/');
        });
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