import { describe, it, expect } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';

describe("Blockchain tests", () => {
    it("should has genesis block", () => {
        const blockchain = new Blockchain();        
        expect(blockchain.blocks.length).toBeGreaterThan(0);
    })    
})