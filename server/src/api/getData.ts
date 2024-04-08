import express, { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import { Options, PythonShell } from "python-shell";
import { Pool, spawn, Worker } from "threads";
import { getDomains } from "../scripts/getDomains";

interface ExtractedText {
  [key: string]: string[];
}

const router: Router = express.Router();
router.get("/api/getdata", async (req: Request, res: Response) => {
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

    const pool = Pool(() => {
      try {
        return spawn(new Worker("../worker.js"));
      } catch (error) {
        console.error("Error creating worker:", error);
        throw error;
      }
    }, poolSize);

    const extractingTextFromPages: ExtractedText = await Promise.all(
      chunks.map((chunk) => pool.queue((run) => run(chunk)))
    ).then((results) => {
      return results.reduce((acc: Object, result: Object) => {
        Object.assign(acc, result);
        return acc;
      }, {});
    });

    pool.completed();
    pool.terminate();

    for (const key in extractingTextFromPages) {
      const arr = extractingTextFromPages[key];
      for (let i = 0; i < arr.length; i++) {
        const value = arr[i];
        const options: Options = {
          mode: "text",
          args: [value],
        };
        const processedData = PythonShell.run(
          "./src/scripts/getAddress.py",
          options
        );
        console.log(processedData);
      }
    }

    res.send(extractingTextFromPages);

    // const outputPath = path.join(__dirname, "..", "data", "extractedText.json");
    // fs.writeFileSync(
    //   outputPath,
    //   JSON.stringify(extractingTextFromPages),
    //   "utf8"
    // );
    // const filePath = "../data/extractedText.json";
    // res.json(filePath);
  } catch (error) {
    res.status(500).send("An error occurred while processing the request.");
  }
});

export default router;
