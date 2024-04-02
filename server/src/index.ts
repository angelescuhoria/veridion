import express, { Express } from "express";
import getDataRouter from "./api/getData";

const app: Express = express();
const port: number = 3001;

app.use("/api/getdata", getDataRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
