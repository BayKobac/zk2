"use client";

import { useState, useEffect } from "react";
import { groth16 } from "snarkjs";

function toAsciiArray20(str: string): number[] {
  const arr = new Array(20).fill(0);
  for (let i=0; i<20; i++) {
    arr[i] = str.charCodeAt(i) || 0;
  }
  return arr;
}

export default function ZKWordPage() {
  const [storedHash, setStoredHash] = useState<string | null>(null);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch("/zk/input.json").then((r) => r.json());
        // data = { storedHash: "..." }
        setStoredHash(data.storedHash);
      } catch (err) {
        console.error(err);
        setResult("input.json loading fail");
      }
    })();
  }, []);

  async function handleCheck() {
    if (!storedHash) {
      setResult("still loading");
      return;
    }
    try {
      // wasm, zkey
      const wasmBuf = await fetch("/zk/WordCheck.wasm").then((r) => r.arrayBuffer());
      const zkeyBuf = await fetch("/zk/WordCheck.zkey").then((r) => r.arrayBuffer());

      // circuit input
      const wordArr = toAsciiArray20(guess);
      const circuitInput = {
        word: wordArr,
        storedHash: storedHash
      };

      // fullProve
      const { proof, publicSignals } = await groth16.fullProve(
        circuitInput,
        new Uint8Array(wasmBuf),
        new Uint8Array(zkeyBuf)
      );

      console.log("proof:", proof);
      console.log("publicSignals:", publicSignals);
      // publicSignals[0] = isMatch

      // verification_key
      const vKey = await fetch("/zk/verification_key.json").then(r => r.json());

      // verify
      const verified = await groth16.verify(vKey, publicSignals, proof);
      if (!verified) {
        setResult("❌ 검증 실패");
        return;
      }

      // isMatch
      const isMatch = Number(publicSignals[0]);
      if (isMatch === 1) {
        setResult("✅ 정답! (storedHash 동일)");
      } else {
        setResult("❌ 오답");
      }
    } catch (err) {
      console.error(err);
      setResult("에러 발생: " + String(err));
    }
  }

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">ZK 단어 검증 (유저 입력 + input.json)</h1>

      <input
        className="border border-gray-300 px-3 py-2 text-black mb-2"
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="단어 입력"
      />

      <button
        onClick={handleCheck}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        검증하기
      </button>

      <div className="mt-4 text-lg font-semibold">
        {result}
      </div>
    </div>
  );
}
