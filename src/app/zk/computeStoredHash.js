// computeStoredHash.js
const { buildPoseidon } = require("circomlibjs");

function toAsciiArray20(str) {
  const arr = new Array(20).fill(0);
  for (let i = 0; i < str.length && i < 20; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

function wordToInt3(asciiArr20) {
  let accum = 0n;
  for (let i = 0; i < 20; i++) {
    accum = accum * 1000n + BigInt(asciiArr20[i]);
  }
  return accum;
}

async function main() {
  const poseidon = await buildPoseidon();

  // inputWord, 선택된 정답단어 하드코딩딩
  const inputWord = "apple";
  const asciiArr = toAsciiArray20(inputWord);

  let accum = wordToInt3(asciiArr);

  const hashBN = poseidon([accum, 0n]);
  const F = poseidon.F;
  const hashBigInt = F.toObject(hashBN);
  const storedHashStr = hashBigInt.toString();
  console.log("storedHash:", storedHashStr);
}

main();
