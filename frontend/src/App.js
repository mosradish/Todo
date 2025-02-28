import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import TodoList from "./components/TodoList";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {

    const [error, setError] = useState("");
    const [user, setUser] = useState(null);

    // エラーメッセージを一定時間後に消す
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(""); // エラーメッセージを消す
            }, 10000); // 10000ms（10秒）後にエラーメッセージを消す

            return () => clearTimeout(timer); // コンポーネントのアンマウント時にタイマーをクリア
        }
    }, [error]); // エラーが更新されるたびに実行される

    // ページ読み込み時に localStorage から user を取得
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));  // JSONをオブジェクトに変換
            } catch (error) {
                console.error("Failed to parse user data from localStorage", error);
            }
        }
    }, []);

    return (
        <Router>
            <div className="app_container">
                <Header user={user} setUser={setUser} />
                    <div className="main_wrapper">
                         {/* error表示 */}
                {error && <h2 className="error">{error}</h2>}  {/* エラーメッセージ表示 */}
                        <Routes>
                            <Route path="/" element={<TodoList setError={setError} />} />
                            <Route path="/register" element={<Register setError={setError} />} />
                            <Route path="/login" element={<Login setUser={setUser} setError={setError} />} />
                            <Route path="/logout" element={<Navigate to="/" />} />
                        </Routes>
                    </div>
                <Footer />
            </div>
        </Router>
    )
}

export default App;
