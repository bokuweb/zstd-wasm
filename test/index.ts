import { decompress } from "../lib";

(async () => {
  const res = await decompress(
    Buffer.from(
      "KLUv/QBgnQQAwskeHWClqgMIrrCtT3yQwJQIidYIgtCCI8CfnRdBEHABc7LJJpvs0EdlsMvRO7p28Yrey89ZfkeXACyZSd71LAiQR1cafMihj+wgczS/jFbbqgmrOzVHbBKaGJLRykjFGgq1huJ6l/zRr1x3pJcML02D7ujcvHWul40DCPwTBwBFDcUn4lZVGMYObwWzOMsKGCoP",
      "base64"
    )
  );
  console.log(res);
  console.log(Buffer.from(res).toString());
})();
