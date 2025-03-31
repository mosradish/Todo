import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";

const ViewportAdjuster = () => {
    const [viewport, setViewport] = useState(
        'width=device-width, initial-scale=1.0'
    );

    useEffect(() => {
        const adjustViewport = () => {
            const deviceWidth = window.screen.width;
            if (deviceWidth < 600) {
                setViewport("width=600, initial-scale=" + deviceWidth / 600);
            } else {
                setViewport("width=device-width, initial-scale=1.0");
            }
        };

        adjustViewport(); // 初回実行
        window.addEventListener("resize", adjustViewport);

        return () => window.removeEventListener("resize", adjustViewport);
    }, []);

    return (
        <Helmet>
            <meta name="viewport" content={viewport} />
        </Helmet>
    );
};

export default ViewportAdjuster;
