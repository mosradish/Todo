import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TodoList from "./components/TodoList";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {

    const [error, setError] = useState("");

    // エラーメッセージを一定時間後に消す
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(""); // エラーメッセージを消す
            }, 5000); // 5000ms（5秒）後にエラーメッセージを消す

            return () => clearTimeout(timer); // コンポーネントのアンマウント時にタイマーをクリア
        }
    }, [error]); // エラーが更新されるたびに実行される

    return (
        <Router>
            <div className="app_container">
                <Header />
                    <div className="main_wrapper">
                         {/* error表示 */}
                {error && <h2 className="error">{error}</h2>}  {/* エラーメッセージ表示 */}
                        <Routes>
                            <Route path="/" element={<TodoList setError={setError} />} />
                            <Route path="/register" element={<Register setError={setError} />} />
                            <Route path="/login" element={<Login setError={setError} />} />
                        </ Routes>
                    </div>
                <Footer />
            </div>
        </Router>
    )
}

export default App;
