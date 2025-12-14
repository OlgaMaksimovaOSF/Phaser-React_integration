import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import initSocket from '../../services/socketService';

import QRCode from '../qrCode/QRCode';

const Connection = () => {
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // "connecting" | "connected" | "disconnected" | "error"
    const [isPaired, setIsPaired] = useState(false); // true | false
    const [gameId, setGameId] = useState(null);

    const navigate = useNavigate();

    const socketRef = useRef(null);

    const connectCb = () => {
        setConnectionStatus('connected');
        if (socketRef.current.id) {
            socketRef.current.emit('createGame');
        }
    }

    const disconnectCb = () => {
        setConnectionStatus('disconnected');
    }

    const pairedCb = (data) => {
        setIsPaired(true);
        navigate(`/screen/${data.gameId}`);
    }

    const gameCreatedCb = (data) => {
        setGameId(data.gameId);
    }

    useEffect(() => {
        const socket = initSocket('screen',
            {
                connect: connectCb,
                gameCreated: gameCreatedCb,
                joined: null,
                paired: pairedCb,
                disconnect: disconnectCb
            }
        );

        socket.connect();

        socketRef.current = socket;
    }, []); 

    return (
        <div>
            <h1>Connection Cmp</h1>
            <p>Connection Status: {connectionStatus}</p>
            <p>Is Paired: {isPaired.toString()}</p>

            {(gameId && !isPaired) && <QRCode gameId={gameId} />}
        </div>
    )
}

export default Connection;