import Block from "./lib/block";
import Blockchain from "./lib/blockchain";


const blockchain = new Blockchain();
const block = new Block(blockchain.nextIndex, blockchain.blocks[0].hash, "data");
blockchain.addBlock(block);