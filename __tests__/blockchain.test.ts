import { describe, it, expect } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import BlockInfo from '../src/lib/blockInfo';

//jest.mock('../src/lib/block');

describe("Blockchain tests", () => {    

    it("should has genesis block", () => {
        const blockchain = new Blockchain();
        expect(blockchain.blocks.length).toBeGreaterThan(0);
    })

    it("should be valid", () => {
        const blockchain = new Blockchain();
        expect(blockchain.isValid()).toBeTruthy();
    })

    it("should NOT be valid", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo | undefined;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, toAddress: "miner001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet001" } as Transaction));
        
        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);

        block.mine(blockchain.getDifficulty());
        blockchain.addBlock(block);
        blockchain.blocks[0].index = -1;
        expect(blockchain.isValid().success).toEqual(false);
    })

    it("should add block", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, toAddress: "miner001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet002" } as Transaction));

        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);

        block.mine(blockchain.getDifficulty());
        const validation = blockchain.addBlock(block);

        expect(validation.success).toEqual(true);
    })

    it("should NOT add a block due another accepted first", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, toAddress: "miner001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet001" } as Transaction));
        
        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);

        block.mine(blockchain.getDifficulty());
        blockchain.blockInfoCache = [] as BlockInfo[];
        const validation = blockchain.addBlock(block);

        expect(validation.success).toEqual(false);
    })

    it("should NOT add block (mined with wrong difficulty)", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, toAddress: "miner001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet001" } as Transaction));
        
        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);
        //block.mine(blockchain.getDifficulty() - 1);
        block.hash = "1".concat(block.hash.slice(0, -1));

        const validation = blockchain.addBlock(block);
        expect(validation.success).toEqual(false);
    })

    it("should NOT add block (missing tx in block)", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, toAddress: "miner001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet002" } as Transaction));

        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);

        block.transactions.pop();
        block.mine(1);

        const validation = blockchain.addBlock(block);
        expect(validation.success).toEqual(false);
    })

    it("should NOT add block (unknown tx in block)", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, toAddress: "miner001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet001" } as Transaction));        

        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);

        block.transactions.push(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet003" } as Transaction));
        block.mine(blockchain.getDifficulty());

        const validation = blockchain.addBlock(block);
        expect(validation.success).toEqual(false);
    })


    it("should get a block", () => {
        let blockchain = new Blockchain();
        const hash = blockchain.getLastBlock().hash;        
        expect(blockchain.getBlock(hash)).toBeInstanceOf(Block);
    })

    it("should get a block info with transactions", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, toAddress: "miner001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet002" } as Transaction));

        blockInfo = blockchain.getNextBlock();
        expect(blockInfo.transactions.length).toBeGreaterThan(0);
    })

    it("should NOT add a transaction", () => {
        const blockchain = new Blockchain();
        const validation = blockchain.addTransaction(new Transaction({ type: TransactionType.FEE } as Transaction));
               
        expect(validation.success).toBe(false);
    })

    it("should get an invalid block info", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        blockInfo = blockchain.getNextBlock();
        expect(blockInfo.transactions.length).toEqual(0);
    })

    it("should get a block info from cache", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;     

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, toAddress: "miner001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: "wallet001" } as Transaction));
        
        blockInfo = blockchain.getNextBlock();
        blockInfo = blockchain.getNextBlock();        
        
        expect(blockInfo).toBeTruthy();
    })


})