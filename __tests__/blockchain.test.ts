import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';

jest.mock('../src/lib/block');

describe("Blockchain tests", () => {    
    let blockchain: Blockchain;
    let block: Block;
    beforeAll(() => {
        blockchain = new Blockchain();
        block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "wallet_1 transfer 1 BTC to wallet_2";
        block.hash = block.generateHash();        
    });

    it("should has genesis block", () => {        
        expect(blockchain.blocks.length).toBeGreaterThan(0);
    })

    it("should be valid", () => {        
        blockchain.addBlock(block);
        expect(blockchain.isValid()).toBeTruthy();
    })

    it("should NOT be valid", () => {        
        blockchain.addBlock(block);
        const last: number = blockchain.getLastBlock().index;
        blockchain.blocks[last].index = -1;
        expect(blockchain.isValid().success).toEqual(false);
    })

    it("should add block", () => {
        const blockchain: Blockchain = new Blockchain();
        const block: Block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "wallet_1 transfer 1 BTC to wallet_2";
        block.hash = block.generateHash();        
        let validation = blockchain.addBlock(block);
        expect(validation.success).toEqual(true);
    })

    it("should NOT add block", () => {
        block.index = -1;        
        expect(blockchain.addBlock(block).success).toEqual(false);
    })

    it("should get a block", () => {        
        const hash = blockchain.getLastBlock().hash;
        expect(blockchain.getBlock(hash)).toBeTruthy();
    })

    it("should get a block info", () => {        
        const blockInfo = blockchain.getNextBlock();
        expect(blockInfo.index).toEqual(blockchain.nextIndex);
    })


})