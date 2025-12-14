import { io } from "socket.io-client";

const URL = `https://${window.location.hostname}:3001`;

let socket = null;
let role = null;

const callbacks = {
    connect: () => console.log('connected'),
    gameCreated: null,
    joined: null,
    paired: null,
    disconnect: () => console.log('disconnected'),
    orientation: null,
    fire: null
}

function linkCallbacks() {
    Object.entries(callbacks).forEach(([evt, cb]) => {
        socket.off(evt);
        if (typeof cb === 'function') {
            socket.on(evt, cb);
        }
    })
}

function initSocket(currentRole, cbCollection = {}) {
    try {
        role = currentRole;

        Object.entries(cbCollection).forEach(([key, cb]) => {
            callbacks[key] = cb;
        });
        
        if (!socket) {
            socket = io(URL);
        }

        linkCallbacks();
    } catch (e) {
        alert('Socket error:', e);
    }
    

    return socket;
}

/**
* Retrieves the current socket instance.
* @returns {Socket} The active socket connection object.
*/
function getSocket() {
    return socket;
}

export default initSocket;
export { getSocket };