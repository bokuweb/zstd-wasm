import { decompress } from '../lib/simple/decompress';

const dataA =
  'KLUv/QBgpQQA0gkfHWClqgMIrrCtT3yQwJQIidYIgtCCI8CfnRdBEHABc7LJJpvs0EdlsMvRV0fXLl7Re/k5y+/oEoAlM8m7ngUB8uhKgw859JEdZI7ml9FqWzVhdafmiE1CE0MyWhmpWEOh1lBc75I/+pXrjvSS4aVp0B2dm7fO9bJxAIF/AgcARQ3FJ+JWVRjGDm8FszjLChgqDw==';

(async () => {
  const resA = await decompress(Buffer.from(dataA, 'base64'));
  const jsonA = Buffer.from(resA).toString();
  console.log(jsonA);
})();
