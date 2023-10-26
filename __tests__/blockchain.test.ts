import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import BlockInfo from '../src/lib/blockInfo';

jest.mock('../src/lib/block');

describe("Blockchain tests", () => {
    let blockchain: Blockchain;
    beforeAll(() => {
        blockchain = new Blockchain();
    });

    it("should has genesis block", () => {
        expect(blockchain.blocks.length).toBeGreaterThan(0);
    })

    it("should be valid", () => {
        expect(blockchain.isValid()).toBeTruthy();
    })

    it("should NOT be valid", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo | undefined;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));

        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);

        block.mine(1);
        blockchain.addBlock(block);
        blockchain.blocks[0].index = -1;
        expect(blockchain.isValid().success).toEqual(false);
    })

    it("should add block", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));

        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);

        block.mine(1);
        const validation = blockchain.addBlock(block);

        expect(validation.success).toEqual(true);
    })

    it("should NOT add block (not mined)", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));

        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);

        //block.mine(1);                
        const validation = blockchain.addBlock(block);
        expect(validation.success).toEqual(false);
    })

    it("should NOT add block (missing tx in block)", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, data: new Date().toString(), hash: "f001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString(), hash: "r001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString(), hash: "r002" } as Transaction));

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

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, data: new Date().toString(), hash: "f001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString(), hash: "r001" } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString(), hash: "r002" } as Transaction));

        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);

        block.transactions.push(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString(), hash: "later" } as Transaction));
        block.mine(1);

        const validation = blockchain.addBlock(block);
        expect(validation.success).toEqual(false);
    })


    it("should get a block", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        let block: Block;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));

        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);
        block.mine(1);
        const validation = blockchain.addBlock(block);
        const hash = validation.message;
        expect(blockchain.getBlock(hash)).toBeInstanceOf(Block);
    })

    it("should get a block info with transactions", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;

        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString() } as Transaction));

        blockInfo = blockchain.getNextBlock();
        expect(blockInfo.transactions.length).toBeGreaterThan(0);
    })

    it("should NOT get a block info", () => {
        let blockchain = new Blockchain();
        let blockInfo: BlockInfo;
        blockInfo = blockchain.getNextBlock();
        expect(blockInfo.transactions.length).toEqual(0);
    })


})