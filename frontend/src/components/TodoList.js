import React, { useEffect, useState } from 'react';
import '../App.css';
import axios from 'axios';

//dayjs
import dayjs from 'dayjs';
import 'dayjs/locale/ja';  // 日本語ロケールのインポート
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from 'dayjs/plugin/localizedFormat';  // localizedFormat プラグインのインポート
import weekday from 'dayjs/plugin/weekday';  // weekday プラグインのインポート
import updateLocale from 'dayjs/plugin/updateLocale';  // updateLocale プラグインのインポート

//mui
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider} from '@mui/x-date-pickers';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(weekday);
dayjs.extend(updateLocale);

// 日本語ロケールを設定
dayjs.locale('ja');
dayjs.updateLocale("ja", {
    weekdays: ["日", "月", "火", "水", "木", "金", "土"],
});

const TodoList = () => {

    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDate, setTaskDate] = useState(new dayjs());
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [inputValue, setInputValue] = useState(selectedDate.format('YYYY年M月D日 H時m分'));

    // タスク一覧を取得
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const token = localStorage.getItem('token'); // 保存されたJWTトークンを取得
    
        try {
            const response = await fetch('http://127.0.0.1:5000/api/tasks', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // トークンをヘッダーに追加
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };

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

    // タスクを追加
    const addTask = () => {
        if (!taskTitle) return;

        // 期限が設定されている場合、ISO形式に変換
        const japanTz = "Asia/Tokyo"; // タイムゾーン指定
        const dueDate = dayjs(selectedDate).tz(japanTz).format(); // ISO 8601 形式

        axios.post("http://127.0.0.1:5000/api/tasks", {
            title: taskTitle,
            due_date: dueDate, // due_dateをサーバーに渡す
        })

        .then((response) => {
            setTasks((prevTasks) => [...prevTasks, response.data]); // 新しいタスクを追加
            setTaskTitle(""); // タスクタイトルをリセット
            setTaskDate(new dayjs()); // 日付をリセット
        })
        .catch(error => {
            setError("タスクの追加中にエラーが発生しました");
            console.error(error);
        });

    };


    // タスクの完了状態を更新
    const toggleTask = (id, currentStatus) => {
        const newStatus = !currentStatus; // 完了状態を切り替える
        const currentTime = newStatus ? new Date().toISOString() : null; // 完了時間をセット

        axios.put(`http://127.0.0.1:5000/api/tasks/${id}`, {
            completed: newStatus,
            completed_time: currentTime
        })
        .then(() => fetchTasks()) // 更新後、タスク一覧を取得
        .catch((error) => console.error("Error updating task:", error));
    };

    // タスクを削除
    const deleteTask = (id) => {
        axios.delete(`http://127.0.0.1:5000/api/tasks/${id}`)
            .then(() => fetchTasks());
    };

    // 完了タスクと未完了タスクを分ける
    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);

    return (

        <div className="main_wrapper">

            {/* 入力欄 */}
            <div className="input_area">
                <input
                    className="task_title"
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="新しいタスク"
                />
                <span className="limit">期限 : </span>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {/* 日付と時間の両方を選択 */}
                    <DateTimePicker
                        label="日時を選択"
                        value={selectedDate}  // ここではdayjsオブジェクトを保持
                        onChange={(newValue) => {
                            if (newValue && dayjs.isDayjs(newValue)) {
                                setSelectedDate(newValue);
                                setInputValue(newValue.format('YYYY年MM月DD日 HH時mm分'));  // フォーマットして更新
                            }
                        }}
                        disablePast
                        minutesStep={5}  // 5分刻み
                        ampm={false}  // 24時間表示
                        format="YYYY年MM月DD日 HH時mm分"
                        slots={{
                            textField: (params) => (
                                <TextField
                                {...params}
                                value={inputValue}
                                onChange={(e) => {
                                    const parsedDate = dayjs(e.target.value, 'YYYY年MM月DD日 HH時mm分');
                                    if (parsedDate.isValid()) {
                                    setSelectedDate(parsedDate);
                                    setInputValue(e.target.value);
                                    }
                                }}
                                />
                            )
                        }}
                    />
                </LocalizationProvider>
                <button className="add" onClick={addTask} disabled={!taskTitle}>追加</button>
            </div>

            {/* error表示 */}
            {error && <h2 className="error">{error}</h2>}  {/* エラーメッセージ表示 */}

            <div className="hr"><hr></hr></div>

            {/* 未完了タスク */}
            <table className="tasklist">
                <caption><span className="red">未完了<i class="fa-regular fa-square checkbox-icon"></i></span>タスク一覧</caption>
                <thead>
                    <tr>
                        <th className="id">ID</th>
                        <th className="title">タイトル</th>
                        <th className="date">作成日時</th>
                        <th className="date">期限</th>
                        <th className="button">操作</th>
                        <th className="button">削除</th>
                    </tr>
                </thead>
                {pendingTasks.map(task => (
                    <tbody>
                        <tr key={task.id}>
                            <th className="id">{task.id}</th>
                            <td className="title red">{task.title}<i class="fa-regular fa-square checkbox-icon"></i></td>
                            <td className="date">
                                {task.created_at ?
                                    new Intl.DateTimeFormat('ja-JP', {
                                        timeZone: 'Asia/Tokyo',
                                        /* year: 'numeric', */
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
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
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }).format(new Date(task.due_date))
                                    : "N/A"
                                }
                            </td>
                            <td className="button">
                            <button onClick={() => toggleTask(task.id, task.completed)}>
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
                <caption><span className="green">完了<i class="fa-regular fa-square-check checkbox-icon"></i></span>タスク一覧</caption>
                <thead>
                    <tr>
                        <th className="id">ID</th>
                        <th className="title">タイトル</th>
                        <th className="date">期限</th>
                        <th className="date">完了日時</th>
                        <th className="date">完了差分</th>
                        <th className="button">操作</th>
                        <th className="button">削除</th>
                    </tr>
                </thead>
                {completedTasks.map(task => (
                    <tbody>
                        <tr key={task.id}>
                            <th className="id">{task.id}</th>
                            <td className={`title ${task.completed ? 'green' : ''}`}>{task.title}<i class="fa-regular fa-square-check checkbox-icon"></i></td>
                            {/* 期日 */}
                            <td className="date">
                                {task.due_date?
                                    new Intl.DateTimeFormat('ja-JP', {
                                        timeZone: 'Asia/Tokyo',
                                        /* year: 'numeric', */
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
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
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }).format(new Date(task.completed_time))
                                    : "N/A"
                                }
                            </td>
                            {/* 完了差分 */}
                            <td className={`date ${(task.due_date <= task.completed_time) ? 'red' : 'green'}`}>
                                {(task.completed_time && task.due_date) ?
                                    (() => {
                                        // due_date と completed_time の差を計算 (ミリ秒単位)
                                        const dueDate = new Date(task.due_date);
                                        const completedTime = new Date(task.completed_time);

                                        //分変換
                                        const dueMinutes = Math.floor(dueDate.getTime() / (1000 * 60)); // ミリ秒から分に変換
                                        const completedMinutes = Math.floor(completedTime.getTime() / (1000 * 60)); // ミリ秒から分に変換

                                        // 差分を分単位で計算
                                        const timeDiffInMinutes = dueMinutes - completedMinutes;

                                        //正符号を表示するためのフォーマット
                                        const formatter = new Intl.NumberFormat("en", { signDisplay: "always" });

                                        //1日以上
                                        if (timeDiffInMinutes >= 1440) {
                                            const timeDiffInDay = Math.floor(timeDiffInMinutes / 1440)
                                            const timeDiffInHour = Math.floor(timeDiffInMinutes % 1440 / 60);
                                            const formatDay = formatter.format(-timeDiffInDay);

                                            return `${formatDay}日${timeDiffInHour}時間`;
                                        }

                                        //1時間以上
                                        if (timeDiffInMinutes >= 60) {
                                            const timeDiffInHour = Math.floor(timeDiffInMinutes / 60);
                                            const formatHour = formatter.format(timeDiffInHour);

                                            return `${-formatHour}時間${timeDiffInMinutes}分`;
                                        }

                                        const formatMinutes = formatter.format(-timeDiffInMinutes);
                                        return `${formatMinutes} 分`;
                                    })()
                                    : "N/A"
                                }
                            </td>
                            <td className="button">
                            <button onClick={() => toggleTask(task.id, task.completed)}>
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
    );
}

export default TodoList;