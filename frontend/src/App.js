import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';


function App() {
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [error, setError] = useState("");

    // タスク一覧を取得
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = () => {
        axios.get("http://127.0.0.1:5000/api/tasks")
            .then(response => setTasks(response.data))
            .catch(error => setError("タスクの取得中にエラーが発生しました"));
    };

    // タスクを追加
    const addTask = () => {
        if (!taskTitle) return;
        axios.post("http://127.0.0.1:5000/api/tasks", { title: taskTitle })
            .then((response) => {
                setTasks((prevTasks) => [...prevTasks, response.data]); // 新しいタスクを追加
                setTaskTitle("");
            })
            .catch(error => setError("タスクの追加中にエラーが発生しました"));
    };

    // タスクの完了状態を更新
    const toggleTask = (id) => {
        axios.put(`http://127.0.0.1:5000/api/tasks/${id}`)
            .then(() => fetchTasks());
    };

    // タスクを削除
    const deleteTask = (id) => {
        axios.delete(`http://127.0.0.1:5000/api/tasks/${id}`)
            .then(() => fetchTasks());
    };

    return (
        <div>
            <Header />

            <div className="main_wrapper">
                <div className="input_area">
                    <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="新しいタスク"
                    />
                    <button onClick={addTask} disabled={!taskTitle}>追加</button>
                </div>


                {error && <p className="error">{error}</p>}  {/* エラーメッセージ表示 */}

                <table className="tasklist">
                    <caption>タスク一覧</caption>
                    <thead>
                        <tr>
                            <th className="id">ID</th>
                            <th className="title">タイトル</th>
                            <th className="date">作成日時</th>
                            <th className="button">操作</th>
                            <th className="button">削除</th>
                        </tr>
                    </thead>
                    {tasks.map(task => (
                        <tbody>
                            <tr key={task.id}>
                                <th className="id">{task.id}</th>
                                <td className={`title ${task.completed ? 'redline' : ''}`}>{task.title}</td>
                                <td className="date">
                                    {task.created_at ? 
                                        new Intl.DateTimeFormat('ja-JP', {
                                            timeZone: 'Asia/Tokyo',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        }).format(new Date(task.created_at))
                                        : "N/A"
                                    }
                                </td>
                                <td className="button">
                                    <button onClick={() => toggleTask(task.id)}>
                                        {task.completed ? "未完了にする" : "完了"}
                                    </button>
                                </td>
                                <td className="button">
                                    <button onClick={() => deleteTask(task.id)}>削除</button>
                                </td>

                            </tr>
                        </tbody>
                    ))}
                </table>
            </div>
            <Footer />
        </div>
    );
}

export default App;
