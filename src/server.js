import http from 'http';

import app from './app.js';
import { initSocket } from './socket.js'
import { initMongodb } from './db/mongodb.js'
import config from './config/config.js';

const server = http.createServer(app);
const PORT = config.port;

await initMongodb();
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}`);
})