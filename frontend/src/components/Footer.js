// Footer.js
import React, { useEffect } from 'react';
import './Footer.css';

const Footer = () => {

    useEffect(() => {
        const updateFooterPosition = () => {
          // ウィンドウの高さ
            const windowHeight = window.innerHeight;
            // コンテンツの高さ
            const bodyHeight = document.body.offsetHeight;
            // フッターの高さ
            const footerHeight = document.getElementById('footer').offsetHeight;

            // フッターを最下部に配置するために調整
            const footer = document.getElementById('footer');

            if (bodyHeight <= windowHeight) {
                footer.style.position = 'absolute';
                footer.style.bottom = '0';
                footer.style.width = '100%'; // 幅を100%に設定
            } else {
                footer.style.position = 'relative';
                footer.style.bottom = 'auto'; // 通常の位置に戻す
            }
        };

        // 初回の位置調整
        updateFooterPosition();

        // リサイズ時に再度フッター位置を調整
        window.addEventListener('resize', updateFooterPosition);

        // クリーンアップ（リサイズイベントを解除）
        return () => {
            window.removeEventListener('resize', updateFooterPosition);
        };

    }, []);

    return (
        <footer id="footer">
            <a href="/">&copy; 2025 Daiki Watanabe ToDoList. All Rights Reserved.</a>
        </footer>
    );

}

export default Footer;
