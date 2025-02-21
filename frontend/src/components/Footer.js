// Footer.js
import React, { useEffect, useState } from 'react';
import './Footer.css';

const Footer = () => {
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const checkBodyWidth = () => {
            const windowWidth = window.innerWidth;  // ウィンドウの幅
            const bodyWidth = document.body.scrollWidth;  // コンテンツの幅

            // bodyの幅がウィンドウの幅を超える場合、フッターを非表示
            if (bodyWidth > windowWidth) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }
        };

        // 初回のチェック
        checkBodyWidth();

        // リサイズ時に再度チェック
        window.addEventListener('resize', checkBodyWidth);

        // クリーンアップ（リサイズイベントを解除）
        return () => {
            window.removeEventListener('resize', checkBodyWidth);
        };

    }, []); // コンポーネントの初回レンダリング後に実行

    return (
        <footer id="footer" style={{ display: isHidden ? 'none' : 'block' }}>
            <a href="/">&copy; 2025 Daiki Watanabe ToDoList. All Rights Reserved.</a>
        </footer>
    );
}

export default Footer;
