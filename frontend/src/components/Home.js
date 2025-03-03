import React, { useEffect, useState } from 'react';
import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import TodoList from "./TodoList";

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate(); // location.state をリセットするために使用
    const [flashMessage, setFlashMessage] = useState(null);

    // フラッシュメッセージのクリア処理
    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => {
                setFlashMessage(null); // メッセージをクリア
            }, 5000); // 5秒後にクリア

            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    // URLの状態（location.state）に応じてフラッシュメッセージを設定
    useEffect(() => {
        if (location.state?.message) {
            setFlashMessage(location.state.message);

            // 🎯 `location.state` をリセット（履歴を書き換えて、messageを消す）
            navigate(".", { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <div>
            {/* 🎯 フラッシュメッセージの表示 */}
            {flashMessage && <h2 className="flash">{flashMessage}</h2>}

            {localStorage.getItem("jwt_token") ? (
                <TodoList />
            ) : (
                <>
                    <h2 className="title">ログインが必要です</h2>
                    <button className="link_button" onClick={() => window.location.href = "/login"}>
                        ログインページへ
                    </button>
                </>
            )}
        </div>
    );
};

export default Home;
