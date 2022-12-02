import * as bodyParser from "body-parser";
import * as express from "express";
import { Logger } from "./logger/logger";
import Routes from "./routes/routes";
import swaggerUi = require('swagger-ui-express');
import fs = require('fs');

import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { Pool } from "pg";

const app = express();
dotenv.config(); //Reads .env file and makes it accessible via process.env
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432")
});

const connectToDB = async () => {
  try {
    await pool.connect();
  } catch (err) {
    console.log(err);
  }
};

connectToDB();

class App {

  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public users: any[];

   /* Swagger files start */
   private swaggerFile: any = (process.cwd()+"/swagger/swagger.json");
   private swaggerData: any = fs.readFileSync(this.swaggerFile, 'utf8');
   private customCss: any = fs.readFileSync((process.cwd()+"/swagger/swagger.css"), 'utf8');
   private swaggerDocument = JSON.parse(this.swaggerData);
   /* Swagger files end */

  constructor() {
      this.express = express();
      this.middleware();
      this.routes();
      this.users = [];
      this.logger = new Logger();
  }

  // Configure Express middleware.
  private middleware(): void {
      this.express.use(bodyParser.json());
      this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  private routes(): void {

      this.express.get("/", (req, res, next) => {
          res.send("API Works!!!!!");
      });

      // user route
      this.express.use("/api", Routes);

      // swagger docs
      this.express.use('/api/docs', swaggerUi.serve,
          swaggerUi.setup(this.swaggerDocument, null, null, this.customCss));

      // handle undefined routes
      this.express.use("*", (req, res, next) => {
          res.send("Make sure url is correct!");
      });
  }
}

// export default new App().express;

// app.get("/test", (req: Request, res: Response, next: NextFunction) => {
//   res.send("hi");
// });

// app.get("/hello", (req: Request, res: Response, next: NextFunction) => {
//   res.send("Hello Rello");
// });

// app.listen(process.env.PORT, () => {
//   console.log(`Server is running at ${process.env.PORT}`);
// });
