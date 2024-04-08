import cors from "cors";
import express, { Express } from "express";
import getDataRouter from "./api/getData";

const app: Express = express();
const port: number = 3001;

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use("/", getDataRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
