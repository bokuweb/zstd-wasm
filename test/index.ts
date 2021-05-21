import { decompress } from "../lib";

const { readFileSync } = require("fs");

const file = readFileSync("./test/hello.zst");

(async () => {
  const res = await decompress(file);
  Buffer.from(res).toString();
})();
