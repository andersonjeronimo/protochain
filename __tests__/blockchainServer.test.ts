//const request = require('supertest');
import request from 'supertest';
import { describe, test, expect, jest, beforeAll } from '@jest/globals';
import { app } from '../src/server/blockchainServer';
import Block from '../src/lib/block';
import Blockchain from '../src/lib/blockchain';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import BlockInfo from '../src/lib/blockInfo';

//jest.mock('../src/lib/block');
//jest.mock('../src/lib/blockchain');

describe('Blockchain Server Tests', () => {
    let blockchain: Blockchain;
    //let block: Block;
    //let blockInfo: BlockInfo;
    beforeAll(() => {
        blockchain = new Blockchain();
        //blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, toAddress: process.env.WALLET_PUBLIC_KEY } as Transaction));
        //blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: process.env.WALLET_PUBLIC_KEY } as Transaction));
        //blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: process.env.WALLET_PUBLIC_KEY } as Transaction));
    })

    test('GET /status', async () => {
        const response = await request(app).get('/status/');
        expect(response.status).toEqual(200);
        expect(response.body.numOfBlocks).toBeGreaterThan(0);
        expect(response.body.isValid.success).toEqual(true);
    })
   /*  test('GET /next - Should get the next block info', async () => {
        const response = await request(app).get('/blocks/next');
        expect(response.body.index).toEqual(blockchain.nextIndex);
    })
    test('GET /:hash - Should get a block', async () => {
        const hash = blockchain.getLastBlock().hash;
        const response = await request(app).get(`/blocks/${hash}`);
        expect(response.body.hash).toEqual(hash);
    })
    test('GET /:hash - Should NOT get a block', async () => {
        let hash = blockchain.getLastBlock().hash;
        hash = hash.concat('modification');
        const response = await request(app).get(`/blocks/${hash}`);
        expect(response.status).toEqual(404);
    })
    test('POST /blocks - Should add a block', async () => {
        const blockchain = new Blockchain();
        blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, toAddress: process.env.WALLET_PUBLIC_KEY } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: process.env.WALLET_PUBLIC_KEY } as Transaction));
        blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, toAddress: process.env.WALLET_PUBLIC_KEY } as Transaction));
        const blockInfo = blockchain.getNextBlock();
        const block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);

        block.mine(1);
        const response = await request(app).post('/blocks/').send(block);
        expect(response.status).toEqual(201);
    })
    test('POST /blocks - Should NOT add a block', async () => {
        blockInfo = blockchain.getNextBlock();
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);
        block.index = -1;
        const response = await request(app).post('/blocks/').send(block);
        expect(response.status).toEqual(422);
    }) */
})