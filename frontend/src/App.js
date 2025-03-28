import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import './App.css';
import './mobile.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import useServerConnection from './hooks/useServerConnection';

// RouterWrapperコンポーネントを作成して、useLocationを使用
function RouterWrapper({ children, setErrorMessage, setIsChecking }) {
    const location = useLocation();
    const { checkServerConnection } = useServerConnection();

    useEffect(() => {
        // ページ推移時に即座にエラーメッセージをクリア
        setErrorMessage(null);

        let isMounted = true;
        setIsChecking(true);

        const checkConnection = async () => {
            try {
                const isConnected = await checkServerConnection();
                if (isMounted) {
                    if (!isConnected) {
                        setErrorMessage("サーバーに接続できませんでした。");
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage("サーバー接続中にエラーが発生しました。");
                }
            } finally {
                if (isMounted) {
                    setIsChecking(false);
                }
            }
        };

        // 接続チェックを即時実行
        const timeoutId = setTimeout(checkConnection);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [location.pathname, checkServerConnection, setErrorMessage, setIsChecking]);

    return children;
}

function App() {

    // 端末のwidthが550px以下の場合、scaleを550pxに調整する
    useEffect(() => {
        const adjustViewport = () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (window.innerWidth < 550) {
                viewport.setAttribute("content", "width=550, initial-scale=" + (window.innerWidth / 550));
            } else {
                viewport.setAttribute("content", "width=device-width, initial-scale=1");
            }
        };

        adjustViewport(); // 初回実行
        window.addEventListener("resize", adjustViewport);

        return () => {
            window.removeEventListener("resize", adjustViewport);
        };
    }, []);

    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error parsing user data from localStorage", error);
            return null;
        }
    });

    const [errorMessage, setErrorMessage] = useState(null);
    const [flashMessage, setFlashMessage] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        console.log("User updated in App.js:", user);
    }, [user]);

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data from localStorage", error);
            }
        } else {
            setUser(null);
        }
    }, []);  // 初回マウント時のみ実行

    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <Router>
            <RouterWrapper setErrorMessage={setErrorMessage} setIsChecking={setIsChecking}>
                <div className="app_container">
                    <Header
                        user={user}
                        handleLogout={handleLogout}
                        setErrorMessage={setErrorMessage}
                        errorMessage={errorMessage}
                        setFlashMessage={setFlashMessage}
                        flashMessage={flashMessage}
                    />
                    {isChecking && (
                        <h4 className="connection">接続を確認しています...</h4>
                    )}
                    <div className="main_wrapper">
                        <Routes>
                            <Route path="/" element={<Home handleLogout={handleLogout} setErrorMessage={setErrorMessage} />} />
                            <Route path="/register" element={<Register setUser={setUser} setErrorMessage={setErrorMessage} />} />
                            <Route path="/login" element={<Login setUser={setUser} setErrorMessage={setErrorMessage} />} />
                            <Route path="/logout" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </RouterWrapper>
        </Router>
    );
}

export default App;