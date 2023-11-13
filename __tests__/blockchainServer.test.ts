//const request = require('supertest');
import request from 'supertest';
import { describe, test, expect, jest, beforeAll } from '@jest/globals';
import { app } from '../src/server/blockchainServer';
import Block from '../src/lib/block';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import BlockInfo from '../src/lib/blockInfo';
import Wallet from '../src/lib/wallet';

//jest.mock('../src/lib/block');

describe('Blockchain Server Tests', () => {    
    let blockInfo: BlockInfo;
    let block: Block;
    let wallet: Wallet;

    beforeAll(() => {
        wallet = new Wallet();
    });

    test('GET /status', async () => {
        const response = await request(app).get('/status/');
        expect(response.status).toEqual(200);
        expect(response.body.numOfBlocks).toBeGreaterThan(0);
        expect(response.body.isValid.success).toEqual(true);
    })

    test('POST /transactions - Should add TX', async () => {
        const tx: Transaction = new Transaction({
            type: TransactionType.REGULAR            
        } as Transaction);
        const response = await request(app).post('/transactions/').send(tx);
        expect(response.status).toEqual(201);
    })

    test('GET /blocks/next - Should get the next block info', async () => {
        const response = await request(app).get('/blocks/next');
        blockInfo = response.body as BlockInfo;
        expect(response.body.index).toBeGreaterThan(0);
    })

    test('POST /blocks - Should add a block', async () => {
        const response1 = await request(app).get('/blocks/next');
        blockInfo = response1.body as BlockInfo;
        block = Block.fromBlockInfo(blockInfo);
        block.mine(blockInfo.difficulty, wallet.publicKey!);
        const response2 = await request(app).post('/blocks/').send(block);
        expect(response2.status).toEqual(201);
    })

    test('GET /:hash - Should get a block', async () => {
        const hash = blockInfo.previousHash;
        const response = await request(app).get(`/blocks/${hash}`);
        expect(response.body.index).toBeLessThan(blockInfo.index);
    })
})