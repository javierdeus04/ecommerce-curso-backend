import http from 'http';

import app from './app.js';
import { initSocket } from './socket.js'
import { initMongodb } from './db/mongodb.js'
import config from './config/config.js';
import { logger } from './config/logger.js';

const server = http.createServer(app);
const PORT = config.port;

await initMongodb();
initSocket(server);

server.listen(PORT, () => {
    logger.info(`Server running in http://localhost:${PORT}`);
})