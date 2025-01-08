pragma circom 2.0.0;

template multiplier2 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;  
   signal output c;  

   // Constraints.  
   c <== a * b;  //same as "a * b ==> c"

}

component main = multiplier2();