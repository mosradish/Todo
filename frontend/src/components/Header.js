// Header.js
import React from 'react';
import './Header.css';

const Header = () => {
    return (
        <header>
            <h1 class="header_title">タスク管理</h1>
            <nav>
                <ul class="title_nav">
                    <li><a href="/">Home</a></li>
                    <li><a href="/tasks">タスク一覧</a></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
