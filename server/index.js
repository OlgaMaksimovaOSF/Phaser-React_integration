
import crypto from 'node:crypto';
import express from 'express';
import { createServer } from 'https';
import fs from 'node:fs';
import path from 'node:path';

import { Server } from 'socket.io';

const games = new Map();

const createGame = () => {
    const gameObj = {
        id: '',
        data: {
            screenSocketId: '',
            controllerSocketId: '',
            status: '', // 'pending', 'active', 'finished'
            createdAt: ''
        }
    }

    gameObj.id = crypto.randomUUID();
    gameObj.data.createdAt = Date.now();
    gameObj.data.status = 'pending';

    return gameObj;
}

const updateGame = (storage, gameObj) => {
    const gameData = storage.get(gameObj.id);

    for (const key in gameObj.data) {
        gameData[key] = gameObj.data[key];
    }
}

const manageGameStorage = (storage, gameObj, action) => {
    switch (action) {
        case 'add': 
            storage.set(gameObj.id, gameObj.data)
            break;
        case 'delete':
            storage.delete(gameObj.id)
            break;
        case 'update':
            updateGame(storage, gameObj);
            break;
        default:
            break;
    }
}

const httpsOptions = {
    key: fs.readFileSync(path.resolve('certs/server-key.pem')),
    cert: fs.readFileSync(path.resolve('certs/server-cert.pem'))
}

const PORT = process.env.PORT || 3001;

const app = express();
const httpsServer = createServer(httpsOptions, app);

const io = new Server(
    httpsServer,
    {
        cors: {
            //origin: ['http://localhost:5173'], // mac address to be added
            origin: '*',
            methods: ['GET', 'POST']
        }
    }
);

httpsServer.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

io.on('connection', (socket) => {
    console.log('a user connected');
    let currentGameId;
    let role;

    socket.on('createGame', (data) => {
        const newGame = createGame();
        role = 'screen';

        newGame.data.screenSocketId = socket.id;
        currentGameId = newGame.id;

        manageGameStorage(games, newGame, 'add');

        socket.emit('gameCreated', {
            gameId: currentGameId
        })
    });

    socket.on('joinGame', (data) => {
        console.log('joinGame');
        const currGame = games.get(data.gameId);

        if (currGame) {
            currGame.controllerSocketId = data.controllerId;
            currGame.status = 'active';
            io.to([currGame.screenSocketId, currGame.controllerSocketId]).emit('paired', { gameId: data.gameId, controllerId: data.controllerId });
        } else {
            socket.emit('error', { message: 'Game not found' });
        }
    });

    socket.on('orientation', (data) => {
        io.to(games.get(data.gameId).screenSocketId).emit('orientation', data);
    });

    socket.on('fire', (data) => {
        io.to(games.get(data.gameId).screenSocketId).emit('fire', data);
    });

    socket.on('kill', (data) => {
        io.to(games.get(games).controllerSocketId).emit('message', {type: 'kill', message: `Good job! Target destroyed! \n Reward: +${data.reward}`})
    })
});
