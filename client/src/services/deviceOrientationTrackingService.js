import throttle from 'lodash.throttle';

let currentHandler = null;
let throttledEmit = null;
let baseBeta = null;
let baseGamma = null;
let prevGammaRaw = null;
let gammaDiff = null;

const ANGLE_MIN = -45;
const ANGLE_MAX = 45;
const ANGLE_RANGE = ANGLE_MAX - ANGLE_MIN;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function clampAngle(value) {
    return clamp(value, ANGLE_MIN, ANGLE_MAX);
}

function normalizeAngle(value) {
    // value is assumed to be clamped, so normalize it to 0..1
    return (value - ANGLE_MIN) / ANGLE_RANGE;
}

function listen(handler) {
    currentHandler = handler;
    window.addEventListener('deviceorientation', currentHandler);
}

function initDefaultOrientationHandler ({ gameId, socket, throttleTime = 200 }) {
    if (!gameId || !socket) return;

    throttledEmit = throttle((evt)=> {
        if (prevGammaRaw === null ) {
            prevGammaRaw = evt.gamma;
        } else {
            gammaDiff = evt.gamma - prevGammaRaw;

            if (gammaDiff > 90) {
                evt.gamma -= 180;
            } else if (gammaDiff < -90) {
                evt.gamma += 180;
            }

            prevGammaRaw = evt.gamma;
        }

        if (baseBeta === null) {
            baseBeta = evt.beta;
        }

        if (baseGamma === null) {
            baseGamma = evt.gamma;
        }

        const beta = clampAngle(evt.beta - baseBeta);
        const gamma = clampAngle(evt.gamma - baseGamma);

        socket.emit('orientation', {
            //alpha: evt.alpha, // not needed for now
            beta,
            gamma,
            normalizedBeta: normalizeAngle(beta),
            normalizedGamma: normalizeAngle(gamma),
            gameId,
        })
    }, throttleTime);

    return function(evt) {
        throttledEmit(evt);
    }
}

function startTracking ({ handler, throttleTime = 100,  gameId, socket }) {
    if (currentHandler) {
        stopTracking();
    }

    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
        alert('Device orientation not supported');
        return;
    }

    if (!handler) {
        handler = initDefaultOrientationHandler({ gameId, socket, throttleTime });
    }

    if (!handler) return;

    
    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        window.DeviceOrientationEvent.requestPermission()
            .then((resp) => {
                if (resp === 'granted') {
                    listen(handler);
                } else {
                    alert('Permission to access device orientation was denied. Please, grant permission to use your device orientation to control the game.');
                }
            })
            .catch((err) => {
                alert('There was an error trying to get permission to access device orientation. Please, grant permission to use your device orientation to control the game.');
            })
    } else {
        listen(handler);
    }
}


function stopTracking() {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent || !currentHandler) {
        return;
    }

    window.removeEventListener('deviceorientation', currentHandler);
    throttledEmit?.cancel();
    throttledEmit = null;
    currentHandler = null;

    baseBeta = null;
    baseGamma = null;
    prevGammaRaw = null;
    
}

const deviceOrientationTrackingService = {
    startTracking,
    stopTracking,
}

export default deviceOrientationTrackingService;
