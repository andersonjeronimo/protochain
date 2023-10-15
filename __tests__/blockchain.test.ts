import { describe, it, expect, jest } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';

jest.mock('../src/lib/block');

describe("Blockchain tests", () => {
    let nonce: number = 1;
    let miner: string = "walletAddress";

    it("should has genesis block", () => {
        const blockchain = new Blockchain();
        expect(blockchain.blocks.length).toBeGreaterThan(0);
    })

    it("should be valid", () => {
        const blockchain = new Blockchain();
        let block: Block = new Block(1, blockchain.getLastBlock().hash, "data", nonce, miner);
        blockchain.addBlock(block);
        expect(blockchain.isValid()).toBeTruthy();
    })

    it("should NOT be valid", () => {
        const blockchain = new Blockchain();
        let block: Block = new Block(1, blockchain.getLastBlock().hash, "data", nonce, miner);
        blockchain.addBlock(block);
        blockchain.blocks[1].index = -1;
        expect(blockchain.isValid().success).toEqual(false);
    })

    it("should add block", () => {
        const blockchain = new Blockchain();
        let block: Block = new Block(1, blockchain.getLastBlock().hash, "data", nonce, miner);  
        let validation = blockchain.addBlock(block);
        expect(validation.success).toEqual(true);
    })

    it("should add block by data", () => {
        const blockchain = new Blockchain();
        const data = "data for new block";
        expect(blockchain.addBlockByData(data).success).toEqual(true);
    })

    it("should NOT add block by data", () => {
        const blockchain = new Blockchain();
        const data = "";
        expect(blockchain.addBlockByData(data).success).toEqual(false);
    })

    it("should NOT add block", () => {
        const blockchain = new Blockchain();
        let block: Block = new Block(1, blockchain.getLastBlock().hash, "data", nonce, miner);        
        block.index = -1;
        expect(blockchain.addBlock(block).success).toBeFalsy();
    })

    it("should get a block", () => {
        const blockchain = new Blockchain();
        const hash = blockchain.getLastBlock().hash;
        expect(blockchain.getBlock(hash)).toBeTruthy();
    })
})