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
        block = new Block(
            blockchain.nextIndex,
            blockchain.getLastBlock().hash,
            "wallet_1 transfer 1 BTC to wallet_2",
            1,
            "wallet_miner");
        blockchain.addBlock(block);
    })

    test('GET /status', async () => {
        const response = await request(app).get('/status/');
        expect(response.status).toEqual(200);
        expect(response.body.numOfBlocks).toBeGreaterThan(1);
        expect(response.body.isValid.success).toEqual(true);
    })
    test('GET /:hash - Should get a block', async () => {
        const hash = blockchain.getLastBlock().hash;
        const response = await request(app).get(`/blocks/${hash}`);
        expect(response.body.block.hash).toEqual(hash);
    })
    test('GET /:hash - Should NOT get a block', async () => {
        let hash = blockchain.getLastBlock().hash;
        hash = hash.concat('modification');
        const response = await request(app).get(`/blocks/${hash}`);        
        expect(response.status).toEqual(404);
    })
    test('POST /blocks - Should add a block', async () => {
        const response = await request(app).post('/blocks/')
        .send({ data: "wallet_2 transfer 1 BTC to wallet_3" });
        expect(response.status).toEqual(201);
    })
    test('POST /blocks - Should NOT add a block', async () => {
        const response = await request(app).post('/blocks/').send({ data: '' });
        expect(response.status).toEqual(422);
    })
})