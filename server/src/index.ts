import express, { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Options, PythonShell } from "python-shell";
import { Pool, spawn, Worker } from "threads";
import { getDomains } from "./scripts/getDomains";

const app: Express = express();
const port = 3001;

app.get("/", async (req: Request, res: Response) => {
  try {
    const domains = await getDomains();
    const testFirstTenDomains = Math.min(domains.length, 1); // testing pupropses

    const chunkSize = 1; // depends on machine specs, can vary; default = 200 (to search all domains)
    const poolSize = 1; // same as above; default = 12
    const chunks = [];
    for (let i = 0; i < testFirstTenDomains; i += chunkSize) {
      // i < domains.length if you want to go through all domains
      chunks.push(domains.slice(i, i + chunkSize));
    }

    const pool = Pool(() => spawn(new Worker("./worker.js")), poolSize);

    const extractingTextFromPages: Object = await Promise.all(
      chunks.map((chunk) => pool.queue((run) => run(chunk)))
    ).then((results) => {
      return results.reduce((acc: Object, result: Object) => {
        Object.assign(acc, result);
        return acc;
      }, {});
    });

    pool.completed();
    pool.terminate();

    let endTime = performance.now();
    console.log(`Process took ${endTime} milliseconds`);

    const outputPath = path.join(__dirname, "..", "data", "extractedText.json");
    fs.writeFileSync(
      outputPath,
      JSON.stringify(extractingTextFromPages, null, 2),
      "utf8"
    );
  } catch (error) {
    res.status(500).send("An error occurred while processing the request.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
