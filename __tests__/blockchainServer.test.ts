//const request = require('supertest');
import request from 'supertest';
import { describe, test, expect, jest } from '@jest/globals';
import { app } from '../src/server/blockchainServer';

jest.mock('../src/lib/block');
jest.mock('../src/lib/blockchain');

describe('Blockchain Server Tests', () => {
    test('GET /status', async () => {
        const response = await request(app).get('/status/');
        expect(response.status).toEqual(200);
        expect(response.body.numOfBlocks).toBeGreaterThan(1);
        expect(response.body.isValid.success).toEqual(true);
    })
    test('GET /:hash - Should get a block', async () => {
        const response = await request(app).get('/blocks/MOCK_HASH');
        expect(response.body.block.hash).toEqual('MOCK_HASH');
    })
    test('GET /:hash - Should NOT get a block', async () => {
        const response = await request(app).get('/blocks/WRONG_HASH');
        expect(response.status).toEqual(404);
    })
    test('POST /blocks - Should add a block', async () => {
        const response = await request(app).post('/blocks/').send({ data: "A transfer 1BTC to B" });
        expect(response.status).toEqual(201);
    })
    test('POST /blocks - Should NOT add a block', async () => {
        const response = await request(app).post('/blocks/').send({ data: '' });
        expect(response.status).toEqual(422);
    })
})