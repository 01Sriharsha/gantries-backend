
// import express from "express";
// import { config } from "./config";
// import { loaders } from "./config/loaders";

// async function init() {
//   const app = express();

//   await loaders({ app });

//   app.listen(config.port, () => {
//     console.log(`Server running at 'http://localhost:${config.port}'✅\n`);
//   });
// }

// init();

import express, { Application } from 'express';
import { config } from './config';
import { loaders } from './config/loaders';
import { WebSocketServer } from './lib/websocket';
import http from 'http';


async function init() {
  const app: Application = express();
  app.use(express.json());

  const PORT = config.port;

  await loaders({ app });

  
  // Create HTTP server
  const httpServer = http.createServer(app);

  // Create and start WebSocket server
  const webSocketServer = new WebSocketServer(app);
  webSocketServer.start(httpServer);

  // Start the Express server
  httpServer.listen(PORT, () => {
    console.log(`Server running at 'http://localhost:${PORT}'✅\n`);
  });
}

// Initialize the app
init();
