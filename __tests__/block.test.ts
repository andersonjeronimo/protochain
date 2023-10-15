import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';

jest.mock('../src/lib/blockchain');
//jest.mock('../src/lib/block');

describe("Block tests", () => {
    let blockchain: Blockchain;
    let block: Block;
    let nonce: number = 1;
    let miner: string = "walletAddress";
    let difficulty: number = 1;
    beforeAll(() => {
        blockchain = new Blockchain();
        block = new Block(
            blockchain.nextIndex,
            blockchain.getLastBlock().hash,
            "Any Bitcoin transaction", nonce, miner);
        blockchain.addBlock(block);

    });
    it("should be valid", () => { 
        const validation = block.isValid(block.index-1, block.previousHash, difficulty);
        expect(validation.success).toBeTruthy();
    })
    it("should NOT be valid (nonce or miner)", () => {
        block.nonce = -1;
        block.miner = "";
        const validation = block.isValid(block.index-1, block.previousHash, difficulty);
        expect(validation.success).toBeFalsy();
    })

    it("should be NOT valid (hash)", () => {        
        let hash = block.previousHash;
        hash = hash.concat("modification");
        const validation = block.isValid(block.index-1, hash, difficulty);
        expect(validation.success).toBeFalsy();
    })
    it("should be NOT valid (timestamp)", () => {        
        block.timestamp = -1;
        const validation = block.isValid(block.index-1, block.previousHash, difficulty);
        expect(validation.success).toBeFalsy();
    })
    it("should be NOT valid (data)", () => {
        block.data = "";
        const validation = block.isValid(block.index-1, block.previousHash, difficulty);
        expect(validation.success).toBeFalsy();
    })
    it("should be NOT valid (index)", () => {
        block.index = -1; 
        const validation = block.isValid(block.index-1, block.previousHash, difficulty);
        expect(validation.success).toBeFalsy();
    })
})