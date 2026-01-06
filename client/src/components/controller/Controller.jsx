const ROLE = 'controller';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import initSocket from '../../services/socketService';
import deviceOrientationTrackingService from '../../services/deviceOrientationTrackingService';

import throttle from 'lodash.throttle';

import Alert from '../shared/alert/Alert';

const Controller = (props) => {
    const socketRef = useRef(null);
    
    const { gameId } = useParams();
    const [isPaired, setIsPaired] = useState(false);
    const [isAiming, setIsAiming] = useState(false);
    const [isHit, setIsHit] = useState(false);
    const [msg, setMsg] = useState('');
 
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
        //alert('Controller paired. Calibrating 🎯 ...');
    }

    const joinedCb = () => {
        // alert('controller joined');
    }

    const disconnectedCb = () => {
        alert('controller disconnected');
        if (socketRef.current?.id && gameId) {
            socketRef.current.emit('connectionlost', { gameId: gameId, role: ROLE });
        }
    }

    const messageCb = (data) => {
        if (data.type === 'kill') {
            setIsHit(true);
            setMsg(data.message);

            setTimeout(() => {
                setIsHit(false);
                setMsg('');
            }, 1000);
        }
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

    const handleFireBtnClick = useCallback(
        throttle(() => {
            socketRef.current.emit('fire', { gameId: gameId });
        }, 500),
        [gameId]
    );


    useEffect(() => {
        const socket = initSocket(ROLE, {
            connect: connectionCb,
            gameCreated: null,
            joined: joinedCb,
            paired: pairedCb,
            disconnect: disconnectedCb,
            message: messageCb

        });

        socket.connect();

        socketRef.current = socket;

        window.addEventListener('beforeunload', disconnectedCb);


        return () => {
            //socket.disconnect();
            //deviceOrientationTrackingService.stopTracking();
        }
    }, []);

    return (
        <>
            <div>
                Controller
                {isPaired ? ' Paired ✅' : ' Not Paired ❌'}
            </div>

            <button className={`btn ${isAiming ? 'btn-danger pos-fixed pos-tr' : 'btn-primary mt-3'} ${!isPaired ? '' : 'hidden'}`} onClick={isAiming ? handleStopAimClick : handleAimClick}>
                {isAiming ? 'Stop Aiming' : 'Start Aiming'}
            </button>

            {
                isAiming && <button className="btn btn-danger mt-3" onClick={handleFireBtnClick}> Fire! </button>
            }

            {   isHit
                && 
                <Alert msg={msg}></Alert>
                    
            }
        </>
    )
};

export default Controller;
