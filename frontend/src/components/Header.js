import React, { useEffect } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

const Header = ({ user, handleLogout}) => {

    useEffect(() => {
        console.log("Updated User in Header:", user);
    }, [user]);    

    return (
        <header>
            <h1 className="header_title">タスク管理</h1>
            <div className="nav_wrapper">
                <nav>
                    <ul className="title_nav">
                        <li><Link to="/">タスク</Link></li>

                        {user ? (
                            <li><button className="logout_button" onClick={handleLogout}>ログアウト</button></li>
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
