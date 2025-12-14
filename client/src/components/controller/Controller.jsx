const ROLE = 'controller';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import initSocket from '../../services/socketService';
import deviceOrientationTrackingService from '../../services/deviceOrientationTrackingService';

const Controller = (props) => {
    const socketRef = useRef(null);
    
    const { gameId } = useParams();
    const [isPaired, setIsPaired] = useState(false);
    const [isAiming, setIsAiming] = useState(false);

    const connectionCb = () => {

        if (socketRef.current?.id && gameId) {
            socketRef.current.emit('joinGame', {
                controllerId: socketRef.current.id,
                gameId: gameId,
                role: ROLE
            });
        }
    };

    const pairedCb = () => {
        alert('Controller paired. Calibrating 🎯 ...');
    }

    const joinedCb = () => {
        alert('controller joined');
    }

    const disconnectedCb = () => {
        alert('controller disconnected')
    }

    const handleAimClick = () => {
        deviceOrientationTrackingService.startTracking(
            {
                socket: socketRef.current,
                gameId: gameId
            }
        );
        setIsPaired(true);
        setIsAiming(true);
    }

    const handleStopAimClick = () => {
        deviceOrientationTrackingService.stopTracking();
        setIsAiming(false);
    }


    useEffect(() => {
        const socket = initSocket(ROLE, {
            connect: connectionCb,
            gameCreated: null,
            joined: joinedCb,
            paired: pairedCb,
            disconnect: disconnectedCb

        });

        socket.connect();

        socketRef.current = socket;


        return () => {
            socket.disconnect();
            deviceOrientationTrackingService.stopTracking();
        }
    }, []);


    return (
        <div>
            Controller
            {isPaired ? ' Paired ✅' : ' Not Paired ❌'}

            <button onClick={isAiming ? handleStopAimClick : handleAimClick}>
                {isAiming ? 'Stop Aiming' : 'Start Aiming'}
            </button>
        </div>
    )
};

export default Controller;
