import { decompress } from '../lib/simple/decompress';
import { init } from '../lib/init';

test('decompress multiple json', async () => {
  const dataA =
    'KLUv/QBgpQQA0gkfHWClqgMIrrCtT3yQwJQIidYIgtCCI8CfnRdBEHABc7LJJpvs0EdlsMvRV0fXLl7Re/k5y+/oEoAlM8m7ngUB8uhKgw859JEdZI7ml9FqWzVhdafmiE1CE0MyWhmpWEOh1lBc75I/+pXrjvSS4aVp0B2dm7fO9bJxAIF/AgcARQ3FJ+JWVRjGDm8FszjLChgqDw==';

  const dataB =
    'KLUv/QBgnQQAwskeHWClqgMIrrCtT3yQwJQIidYIgtCCI8CfnRdBEHABc7LJJpvs0EdlsMvRO7p28Yrey89ZfkeXACyZSd71LAiQR1cafMihj+wgczS/jFbbqgmrOzVHbBKaGJLRykjFGgq1huJ6l/zRr1x3pJcML02D7ujcvHWul40DCPwTBwBFDcUn4lZVGMYObwWzOMsKGCoP';

  await init();
  const resA = decompress(Buffer.from(dataA, 'base64'));
  const jsonA = Buffer.from(resA).toString();
  expect(JSON.parse(jsonA)).toMatchSnapshot();

  const resB = decompress(Buffer.from(dataB, 'base64'));
  const jsonB = Buffer.from(resB).toString();
  expect(JSON.parse(jsonB)).toMatchSnapshot();
});
