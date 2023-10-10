import Block from "./lib/block";


const block0 = new Block(0, 'genesis', 'data');
const block1 = new Block(1, block0.hash, 'data');
console.log(block1.hash);
block1.generateHash();
console.log(block1.hash);
