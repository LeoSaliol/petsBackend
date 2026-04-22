// import app from './app';
// import 'dotenv/config';

// const PORT = process.env.PORT || 2000;

// app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
// });

import app from './app';
import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 2000;

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    console.log('🟢 Usuario conectado');
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
