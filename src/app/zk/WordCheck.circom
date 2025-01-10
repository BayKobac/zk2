pragma circom 2.0.0;

include "./circomlib/circuits/poseidon.circom";

template PoseidonSponge20() {
    signal input arr[20];
    signal output finalHash;

    signal hashState[5];  
    hashState[0] <== 0;

    component p[4];
    for (var i = 0; i < 4; i++) {
        p[i] = Poseidon(6);
    }

    for (var i = 0; i < 4; i++) {
        p[i].inputs[0] <== hashState[i];
        for (var j = 0; j < 5; j++) {
            p[i].inputs[j+1] <== arr[i*5 + j];
        }
        hashState[i+1] <== p[i].out;
    }

    finalHash <== hashState[4];
}

template IsEqual() {
    signal input in[2];
    signal output out;

    signal diff;
    diff <== in[0] - in[1];

    signal inv;
    inv <-- diff == 0 ? 1 : 0;

    // Constraint that enforces inv to be 0 or 1
    inv * (1 - inv) === 0;
    
    // Constraint that enforces inv to be 1 only when diff is 0
    diff * inv === 0;

    out <== inv;
}

template WordCheck() {
    signal input word[20];       // 비밀변수 입력
    signal input storedHash;     // 공개변수 입력
    signal output isMatch;       // 동일시 1, 다를시 0
    
    component sponge = PoseidonSponge20();
    for (var i = 0; i < 20; i++) {
        sponge.arr[i] <== word[i];
    }

    component equalCheck = IsEqual();
    equalCheck.in[0] <== sponge.finalHash;
    equalCheck.in[1] <== storedHash;
    
    isMatch <== equalCheck.out;
}

component main { public [storedHash] } = WordCheck();
