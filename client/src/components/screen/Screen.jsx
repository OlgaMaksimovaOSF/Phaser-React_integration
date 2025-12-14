import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Phaser from "phaser";
import initSocket from "../../services/socketService";
import phaserService from "../../phaser/phaserService";

const Screen = () => {
    const socketRef = useRef(null);
    const gameRef = useRef(null);
    const { gameId } = useParams();
    //const [orientationData, setOrientationData] = useState(null);

    const fireCb = (data) => {
        console.log('fire');
    }
    
    const orientationCb = (data) => {
        if (data.gameId !== gameId) return;

        const gameWidth = gameRef.current?.clientWidth ?? window.innerWidth;
        const gameHeight = gameRef.current?.clientHeight ?? window.innerHeight;

        const normalizedGamma = Phaser.Math.Clamp(
            typeof data.normalizedGamma === 'number'
                ? data.normalizedGamma
                : (data.gamma + 45) / 90,
            0,
            1
        );

        const normalizedBeta = Phaser.Math.Clamp(
            typeof data.normalizedBeta === 'number'
                ? data.normalizedBeta
                : (data.beta + 45) / 90,
            0,
            1
        );

        const normX = 1 - normalizedGamma;
        const normY = 1 - normalizedBeta;

        const x = Phaser.Math.Clamp(normX * gameWidth, 0, gameWidth);
        const y = Phaser.Math.Clamp(normY * gameHeight, 0, gameHeight);

        phaserService.setCrosshairPosition(x, y);
    }

    useEffect(() => {
        socketRef.current = initSocket('screen', {
            fire: fireCb,
            orientation: orientationCb
        });

        if (!socketRef.current?.connected) {
            socketRef.current.connect();
        }

        phaserService.init(gameRef.current);

        return () => {
            phaserService.destroy();

            // @TODO uncomment this in production mode
            // socketRef.current.disconnect();

            //socketRef.current?.off('fire', fireCb);
            //socketRef.current?.off('orientation', orientationCb);
        }

    }, []);


    return (
        <>
            <div id="game-container" ref={gameRef}></div>
        </>
    );
};

export default Screen;
