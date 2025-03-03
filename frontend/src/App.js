import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {
    const [error, setError] = useState("");
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error parsing user data from localStorage", error);
            return null;
        }
    });

    //error表示
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        console.log("User updated in App.js:", user);
    }, [user]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data from localStorage", error);
            }
        }
    }, []);

    // ログアウト処理
    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <Router>
            <div className="app_container">
                <Header user={user} handleLogout={handleLogout} />
                <div className="main_wrapper">
                    {error && <h2 className="error">{error}</h2>}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register setError={setError} setUser={setUser} />} />
                        <Route path="/login" element={<Login setError={setError} setUser={setUser} />} />
                        <Route path="/logout" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
