import nlp from "compromise";
import fs from "fs";
import { ParquetReader } from "parquets";
import path from "path";
import { Pool, spawn, Worker } from "threads";

const getDomains = async () => {
  let domains: Array<string> = [];
  let reader = await ParquetReader.openFile("./data/data.parquet");
  let cursor = reader.getCursor();

  let record = null;
  while ((record = await cursor.next()) && domains.length < 10) {
    // add && domains.length < 10 for testing/debugging purposes
    domains.push(record.domain);
  }

  return domains;
};

const main = async () => {
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
    if (error instanceof Error) {
      console.error("Error: ", error);
    } else console.error("Unknown error occurred: ", error);
  }
};

main();
