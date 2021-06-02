import { decompress } from '../lib/simple/decompress';
import { compress } from '../lib/simple/compress';

const dataA =
  'KLUv/QBgpQQA0gkfHWClqgMIrrCtT3yQwJQIidYIgtCCI8CfnRdBEHABc7LJJpvs0EdlsMvRV0fXLl7Re/k5y+/oEoAlM8m7ngUB8uhKgw859JEdZI7ml9FqWzVhdafmiE1CE0MyWhmpWEOh1lBc75I/+pXrjvSS4aVp0B2dm7fO9bJxAIF/AgcARQ3FJ+JWVRjGDm8FszjLChgqDw==';

const dataB =
  'KLUv/QBgnQQAwskeHWClqgMIrrCtT3yQwJQIidYIgtCCI8CfnRdBEHABc7LJJpvs0EdlsMvRO7p28Yrey89ZfkeXACyZSd71LAiQR1cafMihj+wgczS/jFbbqgmrOzVHbBKaGJLRykjFGgq1huJ6l/zRr1x3pJcML02D7ujcvHWul40DCPwTBwBFDcUn4lZVGMYObwWzOMsKGCoP';

(async () => {
  const resA = await decompress(Buffer.from(dataA, 'base64'));
  console.log(resA);
  const jsonA = Buffer.from(resA).toString();
  console.log(jsonA);
  JSON.parse(jsonA);

  const resB = await decompress(Buffer.from(dataB, 'base64'));
  console.log(resB);
  const jsonB = Buffer.from(resB).toString();
  console.log(jsonB);
  JSON.parse(jsonB);

  console.log('hello');
  const compressed = await compress(Buffer.from('Hello'), 10);
  console.log(compressed);
  const decompressed = await decompress(compressed);
  console.log(Buffer.from(decompressed).toString());
  console.log('finished');
})();
