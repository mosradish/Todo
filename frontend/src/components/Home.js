import '../App.css';
import TodoList from "./TodoList";

const Home = () => {

    return (
        <div>
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
