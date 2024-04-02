import { ParquetReader } from "parquets";

export const getDomains = async () => {
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
