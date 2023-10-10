import { describe, it, expect, beforeAll } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';

describe("Blockchain tests", () => { 
    it("should has genesis block", () => {
        const blockchain = new Blockchain();        
        expect(blockchain.blocks.length).toBeGreaterThan(0);
    })
    it("should be valid", () => {
        const blockchain = new Blockchain();
        let block2: Block = new Block(1, blockchain.blocks[0].hash, "data");
        blockchain.addBlock(block2);
        expect(blockchain.isValid()).toBeTruthy();
    })
    it("should NOT be valid", () => {
        const blockchain = new Blockchain();
        let block2: Block = new Block(1, blockchain.blocks[0].hash, "data");
        blockchain.addBlock(block2);
        blockchain.blocks[1].previousHash = "invalid previous hash";
        expect(blockchain.isValid().success).toBeFalsy();
    })
    it("should add block", () => {
        const blockchain = new Blockchain();
        let block2: Block = new Block(1, blockchain.blocks[0].hash, "data");
        expect(blockchain.addBlock(block2).success).toBeTruthy();
    })
    it("should NOT add block", () => {
        const blockchain = new Blockchain();
        let block2: Block = new Block(1, blockchain.blocks[0].hash, "data");
        block2.previousHash = "";
        expect(blockchain.addBlock(block2).success).toBeFalsy();
    })
})