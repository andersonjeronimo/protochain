import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';
import TransactionType from '../src/lib/transactionType';
import Transaction from '../src/lib/transaction';

jest.mock('../src/lib/blockchain');

describe("Block tests", () => {
    let blockchain: Blockchain;
    let block: Block;
    let blockInfo: BlockInfo;
    let difficulty: number;
    beforeAll(() => {       
        difficulty = 1 
        blockchain = new Blockchain();
        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));

        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);
        block.mine(difficulty);
    });

    it("Should construct a block", () => {
        const block: Block = new Block(
            {
                index: 1,
                timestamp: 1,
                previousHash: blockchain.getLastBlock().hash,
                nonce: 1,
                miner: `${process.env.WALLET_PUBLIC_KEY}`,
                transactions : [] as Transaction[],
                hash: "hash"
            } as Block);

        expect(block.index).toBe(1);
        expect(block.timestamp).toBe(1);
        expect(block.previousHash).toBe(blockchain.getLastBlock().hash);
        expect(block.nonce).toBe(1);
        expect(block.miner).toBe(`${process.env.WALLET_PUBLIC_KEY}`);
        expect(block.transactions).toBeInstanceOf(Array);
        expect(block.hash).toBe("hash");
    })

    it("should be valid", () => {        
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
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (hash)", () => {
        block.nonce = 1;
        block.miner = `${process.env.WALLET_PUBLIC_KEY}`;        
        block.hash = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (hash prefix)", () => {        
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
        block.mine(difficulty);
        block.previousHash = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (timestamp)", () => {        
        block.previousHash = blockchain.getLastBlock().hash;        
        block.timestamp = -1;
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })
    it("should be NOT valid (transactions)", () => {
        block.timestamp = Date.now();
        block.transactions[0].data = "";        
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })
    it("should be NOT valid (transaction type = fee)", () => {        
        block.transactions[0].data = new Date().toString();
        block.transactions[1].type = TransactionType.FEE;
        
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })
    it("should be NOT valid (index)", () => {
        block.transactions[1].type = TransactionType.REGULAR;
        block.index = -1;
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            difficulty);
        expect(validation.success).toEqual(false);
    })
    it("should provide a Block from block info", () => {        
        const blockInfo: BlockInfo = blockchain.getNextBlock();
        expect(Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`)).toBeInstanceOf(Block);
    })
})