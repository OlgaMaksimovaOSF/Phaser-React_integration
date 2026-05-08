import throttle from 'lodash.throttle';

let currentHandler = null;
let throttledEmit = null;
let baseBeta = null;
let baseGamma = null;
let prevGammaRaw = null;
let gammaDiff = null;
let prevNormalizedBeta = null;
let prevNormalizedGamma = null;

const HORIZONTAL_DELTA_MIN = -45;
const HORIZONTAL_DELTA_MAX = 45;
const VERTICAL_DELTA_MIN = -45;
const VERTICAL_DELTA_MAX = 30;
const VERTICAL_SOFT_LIMIT = 85;
const LOW_PASS_ALPHA = 0.2;
const DEAD_ZONE = 0.01;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function clampToRange(value, min, max) {
    return clamp(value, min, max);
}

function normalizeToUnit(value, min, max) {
    return (value - min) / (max - min);
}

function applySmoothing(current, prev) {
    if (prev === null) return current;
    return prev + (current - prev) * LOW_PASS_ALPHA;
}

function applyDeadZone(current, prev) {
    if (prev === null) return current;
    return Math.abs(current - prev) < DEAD_ZONE ? prev : current;
}

function adjustForScreenOrientation(beta, gamma) {
    const angle = window?.screen?.orientation?.angle ?? window?.orientation ?? 0;

    switch (angle) {
        case 90:
            return { beta: gamma, gamma: -beta };
        case -90:
            return { beta: -gamma, gamma: beta };
        case 180:
        case -180:
            return { beta: -beta, gamma: -gamma };
        default:
            return { beta, gamma };
    }
}

function normalizeEuler(beta, gamma) {
    if (Math.abs(beta) > 90) {
        beta = beta > 0 ? 180 - beta : -180 - beta;
        gamma = -gamma;
    }

    return { beta, gamma };
}

function listen(handler) {
    currentHandler = handler;
    window.addEventListener('deviceorientation', currentHandler);
}

function initDefaultOrientationHandler ({ gameId, socket, throttleTime = 200 }) {
    if (!gameId || !socket) return;

    throttledEmit = throttle((evt)=> {
        if (typeof evt.beta !== 'number' || typeof evt.gamma !== 'number') return;

        const adjusted = adjustForScreenOrientation(evt.beta, evt.gamma);
        const normalized = normalizeEuler(adjusted.beta, adjusted.gamma);
        let rawGamma = normalized.gamma;
        const rawBeta = clamp(normalized.beta, -VERTICAL_SOFT_LIMIT, VERTICAL_SOFT_LIMIT);

        if (prevGammaRaw === null ) {
            prevGammaRaw = rawGamma;
        } else {
            gammaDiff = rawGamma - prevGammaRaw;

            if (gammaDiff > 90) {
                rawGamma -= 180;
            } else if (gammaDiff < -90) {
                rawGamma += 180;
            }

            prevGammaRaw = rawGamma;
        }

        if (baseBeta === null) {
            baseBeta = rawBeta;
        }

        if (baseGamma === null) {
            baseGamma = rawGamma;
        }

        const deltaBeta = rawBeta - baseBeta;
        const deltaGamma = rawGamma - baseGamma;
        const beta = clampToRange(deltaBeta, VERTICAL_DELTA_MIN, VERTICAL_DELTA_MAX);
        const gamma = clampToRange(deltaGamma, HORIZONTAL_DELTA_MIN, HORIZONTAL_DELTA_MAX);
        let normalizedBeta = normalizeToUnit(beta, VERTICAL_DELTA_MIN, VERTICAL_DELTA_MAX);
        let normalizedGamma = normalizeToUnit(gamma, HORIZONTAL_DELTA_MIN, HORIZONTAL_DELTA_MAX);

        normalizedBeta = applyDeadZone(normalizedBeta, prevNormalizedBeta);
        normalizedGamma = applyDeadZone(normalizedGamma, prevNormalizedGamma);

        normalizedBeta = applySmoothing(normalizedBeta, prevNormalizedBeta);
        normalizedGamma = applySmoothing(normalizedGamma, prevNormalizedGamma);

        prevNormalizedBeta = normalizedBeta;
        prevNormalizedGamma = normalizedGamma;

        socket.emit('orientation', {
            //alpha: evt.alpha, // not needed for now
            beta,
            gamma,
            normalizedBeta,
            normalizedGamma,
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
    gammaDiff = null;
    prevNormalizedBeta = null;
    prevNormalizedGamma = null;
    
}

const deviceOrientationTrackingService = {
    startTracking,
    stopTracking,
}

export default deviceOrientationTrackingService;
