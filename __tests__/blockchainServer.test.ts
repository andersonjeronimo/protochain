//const request = require('supertest');
import request from 'supertest';
import { describe, test, expect, jest, beforeAll } from '@jest/globals';
import { app } from '../src/server/blockchainServer';
import Block from '../src/lib/block';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import BlockInfo from '../src/lib/blockInfo';

//jest.mock('../src/lib/block');

describe('Blockchain Server Tests', () => {

    let blockInfo: BlockInfo;
    let block: Block;

    test('GET /status', async () => {
        const response = await request(app).get('/status/');
        expect(response.status).toEqual(200);
        expect(response.body.numOfBlocks).toBeGreaterThan(0);
        expect(response.body.isValid.success).toEqual(true);
    })    

    test('POST /transactions - Should add TX', async () => {        
        const tx: Transaction = new Transaction({
            type: TransactionType.REGULAR,
            toAddress:"wallet001"
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
        block = Block.fromBlockInfo(blockInfo, `${process.env.WALLET_PUBLIC_KEY}`);
        block.mine(blockInfo.difficulty);
        const response = await request(app).post('/blocks/').send(block);
        expect(response.status).toEqual(201);
    })

    test('GET /:hash - Should get a block', async () => {
        const hash = blockInfo.previousHash;      
        const response = await request(app).get(`/blocks/${hash}`);
        expect(response.body.index).toBeLessThan(blockInfo.index);
    })    
})