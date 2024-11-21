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

import express, { Application } from "express";
import { config } from "./config";
import { loaders } from "./config/loaders";
import { ChatSocket } from "./sockets/chat";
import http from "http";
import { apiResponse } from "./util/api-response";

async function init() {
  const app: Application = express();
  app.use(express.json());

  const PORT = config.port;

  await loaders({ app });

  const httpServer = http.createServer(app);

  // Initialize Socket.IO
  const socketServer = new ChatSocket(httpServer);
  socketServer.start();

  app.get("/hello", (req, res) => {
    return apiResponse(res, 200, { message: "Hello from gantries server!" });
  });

  // Start the Express server
  httpServer.listen(PORT, () => {
    console.log(`Server running at 'http://localhost:${PORT}'✅\n`);
  });
}

// Initialize the app
init();
