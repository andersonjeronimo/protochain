import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';

jest.mock('../src/lib/blockchain');

describe("Block tests", () => {
    let blockchain: Blockchain;
    let block: Block;
    let difficulty: number;
    beforeAll(() => {
        difficulty = 1;
        blockchain = new Blockchain();
        block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.nonce = 1;
        block.miner = "wallet_miner";
        block.data = "wallet_1 transfer 1 BTC to wallet_2";
        block.hash = block.generateHash();
    });

    it("should be valid", () => {
        block.mine(difficulty);
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(true);
    })

    it("should NOT be valid (nonce or miner)", () => {
        block.nonce = -1;
        block.miner = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toBeFalsy();
    })

    it("should be NOT valid (hash)", () => {
        block.hash = block.hash.concat("modification");
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toBeFalsy();
    })
    it("should be NOT valid (timestamp)", () => {
        block.timestamp = -1;
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toBeFalsy();
    })
    it("should be NOT valid (data)", () => {
        block.data = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toBeFalsy();
    })
    it("should be NOT valid (index)", () => {
        block.index = -1;
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toBeFalsy();
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
        expect(Block.fromBlockInfo(blockInfo, minerWallet.publicKey)).toBeTruthy();
    })
})