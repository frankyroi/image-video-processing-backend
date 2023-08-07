//src/index.ts
import express from "express";
import { createConnection } from "typeorm";
import { assetRoutes } from "./routes/assetRoutes";
import cors from "cors"; 

const dotenv = require('dotenv');
dotenv.config(); // Loads the environment variables from .env into process.env
const ormConfig = require('../ormconfig.json');

// import { config } from 'dotenv';
// config();
export const app = express();

app.use(express.json());

app.use(cors());


createConnection()
  .then(() => {
    console.log("Connected to the database.");

    app.use(express.static('dist/public'));

    app.use("/api/asset", assetRoutes);

    const port = process.env.PORT || 5001;
    app.listen(port, () => {
      console.log(`Server started on port ${port}.`);
    });
  })
  .catch((error) => console.error("Database connection error:", error));
