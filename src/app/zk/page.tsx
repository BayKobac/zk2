"use client";

import { useState } from "react";
import { groth16 } from "snarkjs";

function toAsciiArray20(str: string): number[] {
  const arr = new Array(20).fill(0);
  for (let i=0; i<20; i++) {
    arr[i] = str.charCodeAt(i) || 0;
  }
  return arr;
}

export default function ZKPage() {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");

  // 예: DB에 "12345678901234567890" 라고 저장됐다고 가정
  const STORED_HASH = "12345678901234567890";

  async function handleCheck() {
    try {
      const wasmBytes = await fetch("/build/WordCheck_js/WordCheck.wasm").then(r=>r.arrayBuffer());
      const zkeyBytes = await fetch("/build/WordCheck.zkey").then(r=>r.arrayBuffer());

      // input
      const wordArr = toAsciiArray20(guess);
      const input = {
        word: wordArr,
        storedHash: STORED_HASH
      };

      // Proof
      const { proof, publicSignals } = await groth16.fullProve(
        input,
        new Uint8Array(wasmBytes),
        new Uint8Array(zkeyBytes)
      );

      console.log(proof, publicSignals);

      // verify
      const vKey = await fetch("/build/verification_key.json").then(r => r.json());
      const verified = await groth16.verify(vKey, publicSignals, proof);

      if (!verified) {
        setResult("❌ 검증 실패");
        return;
      }
      const isMatch = Number(publicSignals[0]);
      if (isMatch === 1) {
        setResult("✅ 정답!");
      } else {
        setResult("❌ 오답!");
      }
    } catch (err) {
      console.error(err);
      setResult("에러: " + String(err));
    }
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="mb-4 text-xl font-bold">ZK WordCheck</h1>
      <input
        className="border px-3 py-2 mb-2 text-black"
        value={guess}
        onChange={e=> setGuess(e.target.value)}
        placeholder="단어 입력"
      />
      <button
        onClick={handleCheck}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        ZK 증명
      </button>
      <div className="mt-4">{result}</div>
    </div>
  );
}
