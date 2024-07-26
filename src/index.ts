import express from "express";
import { config } from "./config";
import { loaders } from "./config/loaders";

async function init() {
  const app = express();

  await loaders({ app });

  app.listen(config.port, () => {
    console.log(`Server running at 'http://localhost:${config.port}'✅\n`);
  });
}

init();
