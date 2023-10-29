import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import Wallet from '../src/lib/wallet';

//jest.mock('../src/lib/someClass');

describe("Wallet tests", () => {
    
    beforeAll(() => {
        
    });

    it("Should construct a wallet", () => {
        const wallet = new Wallet();        
        expect(wallet).toBeInstanceOf(Wallet);
    })

    
})