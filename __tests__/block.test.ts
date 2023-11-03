import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';
import TransactionType from '../src/lib/transactionType';
import Transaction from '../src/lib/transaction';
import Wallet from '../src/lib/wallet';

//jest.mock('../src/lib/blockchain');

describe("Block tests", () => {
    let blockchain: Blockchain;
    let block: Block;
    let blockInfo: BlockInfo;
    let wallet: Wallet;
    beforeAll(() => {
        wallet = new Wallet();
        blockchain = new Blockchain();        
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: process.env.WALLET_PUBLIC_KEY } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: process.env.WALLET_PUBLIC_KEY } as Transaction));

        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);
        block.mine(blockchain.getDifficulty());
    });

    it("Should construct a block", () => {
        const block: Block = new Block(
            {
                index: 1,
                timestamp: 1,
                previousHash: blockchain.getLastBlock().hash,
                nonce: 1,
                miner: wallet.publicKey,
                transactions: [] as Transaction[],
                hash: "hash"
            } as Block);

        expect(block.index).toBe(1);
        expect(block.timestamp).toBe(1);
        expect(block.previousHash).toBe(blockchain.getLastBlock().hash);
        expect(block.nonce).toBe(1);
        expect(block.miner).toBe(wallet.publicKey);
        expect(block.transactions).toBeInstanceOf(Array);
        expect(block.hash).toBe("hash");
    })

    it("should be valid", () => {
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            blockchain.getDifficulty());
        expect(validation.success).toEqual(true);
    })

    it("should NOT be valid (nonce or miner)", () => {
        block.nonce = -1;
        block.miner = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            blockchain.getDifficulty());
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (hash)", () => {
        block.nonce = 1;
        block.miner = wallet.publicKey!;
        block.hash = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            blockchain.getDifficulty());
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (hash prefix)", () => {
        block.mine(blockchain.getDifficulty() - 1);
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            blockchain.getDifficulty());
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (previousHash)", () => {
        block.mine(blockchain.getDifficulty());
        block.previousHash = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            blockchain.getDifficulty());
        expect(validation.success).toEqual(false);
    })

    it("should be NOT valid (timestamp)", () => {
        block.previousHash = blockchain.getLastBlock().hash;
        block.timestamp = -1;
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            blockchain.getDifficulty());
        expect(validation.success).toEqual(false);
    })
    it("should be NOT valid (transactions)", () => {
        block.timestamp = Date.now();
        block.transactions[0].toAddress = "";
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            blockchain.getDifficulty());
        expect(validation.success).toEqual(false);
    })
    it("should be NOT valid (transaction type = fee)", () => {
        block.transactions[0].toAddress = wallet.publicKey;
        block.transactions[1].type = TransactionType.FEE;

        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            blockchain.getDifficulty());
        expect(validation.success).toEqual(false);
    })
    it("should be NOT valid (index)", () => {
        block.transactions[1].type = TransactionType.REGULAR;
        block.index = -1;
        const validation = block.isValid(
            blockchain.getLastBlock().index,
            blockchain.getLastBlock().hash,
            blockchain.getDifficulty());
        expect(validation.success).toEqual(false);
    })
    it("should provide a Block from block info", () => {
        const blockInfo: BlockInfo = blockchain.getNextBlock();
        expect(Block.fromBlockInfo(blockInfo, wallet.publicKey!)).toBeInstanceOf(Block);
    })
})