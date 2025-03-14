import React, { useEffect, useState } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ user, handleLogout, setErrorMessage, errorMessage, setFlashMessage, flashMessage }) => {

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Updated User in Header:", user);
    }, [user]);

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/api/user", { withCredentials: true });
                if (response.status !== 200) {
                    handleLogout();
                }
            } catch (error) {
                console.log("Backend unreachable, setting user to null");
                handleLogout();
            }
        };

        checkUserStatus();
    }, []);

    // エラーメッセージのクリア処理
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // フラッシュメッセージのクリア処理
    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => {
                setFlashMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    // URLの状態（location.state）に応じてフラッシュメッセージを設定
    useEffect(() => {
        if (location.state?.message) {
            setFlashMessage(location.state.message);
            navigate(".", { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <div className="header_wrapper">
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
                {user && user.name && (
                    <div className="user_info">
                        <span className="bold">ようこそ、{user.name}さん！</span>
                    </div>
                )}

            </header>
            {/* エラーメッセージの表示 */}
            {errorMessage && <h2 className="error">{errorMessage}</h2>}
            {/* フラッシュメッセージの表示 */}
            {flashMessage && <h2 className="flash">{flashMessage}</h2>}
        </div>
    );
};

export default Header;
