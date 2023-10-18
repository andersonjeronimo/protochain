import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';

jest.mock('../src/lib/blockchain');

describe("Block tests", () => {
    let blockchain: Blockchain;
    let difficulty: number;
    beforeAll(() => {
        difficulty = 2;
        blockchain = new Blockchain();
    });

    it("Should construct a block", () => {
        const block: Block = new Block(
            {
                index: 1,
                timestamp: 1,
                previousHash: blockchain.getLastBlock().hash,
                nonce: 1,
                miner: `${process.env.WALLET_PUBLIC_KEY}`,
                data: "cryptocurrency transaction",
                hash: "hash"
            } as Block);

        expect(block.index).toBe(1);
        expect(block.timestamp).toBe(1);
        expect(block.previousHash).toBe(blockchain.getLastBlock().hash);
        expect(block.nonce).toBe(1);
        expect(block.miner).toBe(`${process.env.WALLET_PUBLIC_KEY}`);
        expect(block.data).toBe("cryptocurrency transaction");
        expect(block.hash).toBe("hash");
    })

    it("should be valid", () => {
        let block: Block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "should be valid test";
        block.mine(difficulty);
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(true);
    })

    it("should NOT be valid (nonce or miner)", () => {
        let block: Block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "nonce or miner test";
        block.mine(difficulty);
        block.nonce = -1;
        block.miner = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (hash)", () => {
        let block: Block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "invalid hash test";
        block.mine(difficulty);
        block.hash = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (hash prefix)", () => {
        let block: Block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "invalid hash prefix test";
        block.mine(difficulty);
        let _hash = block.hash;
        let _prefix = new Array(difficulty + 1).join("x");
        block.hash = _prefix.concat(_hash.slice(difficulty + 1, _hash.length + 1));
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (previousHash)", () => {
        let block: Block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "invalid previous hash test";
        block.mine(difficulty);
        block.previousHash = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (timestamp)", () => {
        let block: Block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "timestamp test";
        block.mine(difficulty);
        block.timestamp = -1;
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })
    it("should be NOT valid (data)", () => {
        let block: Block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "invalid data test";
        block.mine(difficulty);
        block.data = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })
    it("should be NOT valid (index)", () => {
        let block: Block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "invalid index test";
        block.mine(difficulty);
        block.index = -1;
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })
    it("should provide a Block from block info", () => {
        const minerWallet = {
            privateKey: "privateKey",
            publicKey: "publicKey"
        }
        const info = {
            index: 1,
            previousHash: "previousHash",
            data: "X transfer 1 BTC to Y"
        }
        const blockInfo: BlockInfo = info as BlockInfo;
        expect(Block.fromBlockInfo(blockInfo, minerWallet.publicKey)).toBeInstanceOf(Block);
    })    
})