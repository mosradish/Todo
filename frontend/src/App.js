import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import DatePicker from 'react-datepicker';
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import 'react-datepicker/dist/react-datepicker.css';

function App() {
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDate, setTaskDate] = useState(new Date());
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date()); // selectedDate と setSelectedDate を定義

    // タスク一覧を取得
    useEffect(() => {
        fetchTasks();
    }, []);

    // エラーメッセージを一定時間後に消す
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(""); // エラーメッセージを消す
            }, 5000); // 5000ms（5秒）後にエラーメッセージを消す

            return () => clearTimeout(timer); // コンポーネントのアンマウント時にタイマーをクリア
        }
    }, [error]); // エラーが更新されるたびに実行される

    const fetchTasks = () => {
        axios.get("http://127.0.0.1:5000/api/tasks")
            .then(response => setTasks(response.data))
            .catch(error => setError("タスクの取得中にエラーが発生しました"));
    };

    // タスクを追加
    const addTask = () => {
        if (!taskTitle) return;

        // 期限が設定されている場合、ISO形式に変換
        const dueDate = selectedDate ? selectedDate.toISOString() : null;

        axios.post("http://127.0.0.1:5000/api/tasks", { 
            title: taskTitle,
            due_date: dueDate, // due_dateをサーバーに渡す
        })
            .then((response) => {
                setTasks((prevTasks) => [...prevTasks, response.data]); // 新しいタスクを追加
                setTaskTitle("");
                setTaskDate(new Date()); // 日付をリセット
            })
            .catch(error => setError("タスクの追加中にエラーが発生しました"));
    };

    // タスクの完了状態を更新
    const toggleTask = (id) => {
        const currentTime = new Date().toISOString(); // 現在の時刻をISO形式で取得
        axios.put(`http://127.0.0.1:5000/api/tasks/${id}`, { completed_time: currentTime })
            .then(() => fetchTasks());
    };

    // タスクを削除
    const deleteTask = (id) => {
        axios.delete(`http://127.0.0.1:5000/api/tasks/${id}`)
            .then(() => fetchTasks());
    };

    const formatDate = (date) => {
        return format(date, "yyyy年M月d日(E) HH:mm", { locale: ja });
    };

    // 完了タスクと未完了タスクを分ける
    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);

    return (
        <div>
            <Header />

            <div className="main_wrapper">

                {/* 入力欄 */}
                <div className="input_area">
                    <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="新しいタスク"
                    />
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        showTimeSelect
                        dateFormat={selectedDate ? formatDate(selectedDate) : "未選択"}
                        timeFormat="HH:mm"
                        timeIntervals={5} // 5分単位で時間選択
                        className="datepicker"
                    />
                    <button onClick={addTask} disabled={!taskTitle}>追加</button>
                </div>

                {/* error表示 */}
                {error && <p className="error">{error}</p>}  {/* エラーメッセージ表示 */}

                <div className="hr"><hr></hr></div>

                {/* 未完了タスク */}
                <table className="tasklist">
                    <caption>未完了タスク一覧</caption>
                    <thead>
                        <tr>
                            <th className="id">ID</th>
                            <th className="title">タイトル</th>
                            <th className="date">作成日時</th>
                            <th className="date">期限</th>
                            <th className="complete">完了/未完了</th>
                            <th className="button">操作</th>
                            <th className="button">削除</th>
                        </tr>
                    </thead>
                    {pendingTasks.map(task => (
                        <tbody>
                            <tr key={task.id}>
                                <th className="id">{task.id}</th>
                                <td className={`title ${task.completed ? 'redline' : ''}`}>{task.title}</td>
                                <td className="date">
                                    {task.created_at ?
                                        new Intl.DateTimeFormat('ja-JP', {
                                            timeZone: 'Asia/Tokyo',
                                            /* year: 'numeric', */
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        }).format(new Date(task.created_at))
                                        : "N/A"
                                    }
                                </td>
                                <td className=
                                    {`date ${!task.completed && (new Date(task.due_date) <= new Date()) ? 'gray' : ''} ${task.completed ? 'green' : ''}`}>
                                    {task.due_date?
                                        new Intl.DateTimeFormat('ja-JP', {
                                            timeZone: 'Asia/Tokyo',
                                            /* year: 'numeric', */
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        }).format(new Date(task.due_date))
                                        : "N/A"
                                    }
                                </td>
                                <td className={`complete bold ${task.completed ? 'green' : 'red'}`}>
                                    {task.completed ? (
                                            <>完了<i class="fa-regular fa-square-check checkbox-icon"></i></> 
                                        ) : (
                                            <>未完了<i class="fa-regular fa-square checkbox-icon"></i></>
                                        )
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

                <div className="hr"><hr></hr></div>

                {/* 完了タスク */}
                <table className="tasklist">
                    <caption>完了済みタスク一覧</caption>
                    <thead>
                        <tr>
                            <th className="id">ID</th>
                            <th className="title">タイトル</th>
                            <th className="date">期限</th>
                            <th className="date">完了日時</th>
                            <th className="complete">完了/未完了</th>
                            <th className="button">操作</th>
                            <th className="button">削除</th>
                        </tr>
                    </thead>
                    {completedTasks.map(task => (
                        <tbody>
                            <tr key={task.id}>
                                <th className="id">{task.id}</th>
                                <td className={`title ${task.completed ? 'redline' : ''}`}>{task.title}</td>
                                {/* 期日 */}
                                <td className=
                                    {`date ${!task.completed && (new Date(task.due_date) <= new Date()) ? 'gray' : ''} ${task.completed ? 'green' : ''}`}>
                                    {task.due_date?
                                        new Intl.DateTimeFormat('ja-JP', {
                                            timeZone: 'Asia/Tokyo',
                                            /* year: 'numeric', */
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        }).format(new Date(task.due_date))
                                        : "N/A"
                                    }
                                </td>
                                {/* 完了日時 */}
                                <td className="date">
                                    {task.completed_time ?
                                        new Intl.DateTimeFormat('ja-JP', {
                                            timeZone: 'Asia/Tokyo',
                                            /* year: 'numeric', */
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        }).format(new Date(task.completed_time))
                                        : "N/A"
                                    }
                                </td>
                                <td className={`complete bold ${task.completed ? 'green' : 'red'}`}>
                                    {task.completed ? (
                                            <>完了<i class="fa-regular fa-square-check checkbox-icon"></i></> 
                                        ) : (
                                            <>未完了<i class="fa-regular fa-square checkbox-icon"></i></>
                                        )
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
