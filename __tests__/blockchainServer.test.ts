//const request = require('supertest');
import request from 'supertest';
import { describe, test, expect, jest, beforeAll } from '@jest/globals';
import { app } from '../src/server/blockchainServer';
import Block from '../src/lib/block';
import Blockchain from '../src/lib/blockchain';

jest.mock('../src/lib/block');
jest.mock('../src/lib/blockchain');

describe('Blockchain Server Tests', () => {

    let blockchain: Blockchain;
    let block: Block;
    beforeAll(() => {
        blockchain = new Blockchain();
        block = new Block();
        block.index = blockchain.nextIndex;
        block.previousHash = blockchain.getLastBlock().hash;
        block.data = "wallet_1 transfer 1 BTC to wallet_2";
        block.nonce = 1;
        block.miner = "wallet_miner";    
    })

    test('GET /status', async () => {
        const response = await request(app).get('/status/');
        expect(response.status).toEqual(200);
        expect(response.body.numOfBlocks).toBeGreaterThan(0);
        expect(response.body.isValid.success).toEqual(true);
    })
    test('GET /next - Should get the next block info', async () => {
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
        const response = await request(app).post('/blocks/').send(block);
        expect(response.status).toEqual(201);
    })
    test('POST /blocks - Should NOT add a block', async () => {        
        const response = await request(app).post('/blocks/').send(block);
        expect(response.status).toEqual(422);
    })
})