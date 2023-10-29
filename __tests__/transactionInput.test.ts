import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';

//jest.mock('../src/lib/someClass');

describe("Tx input tests", () => {
    let alice: Wallet;
    beforeAll(() => {
        alice = new Wallet();
    });

    it("Should construct a transaction input", () => {
        const txInput = new TransactionInput();
        expect(txInput).toBeInstanceOf(TransactionInput);
    })

    it("Should be valid", () => {
        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey
        } as TransactionInput);
        txInput.sign(alice.privateKey);
        const validation = txInput.isValid();
        expect(validation.success).toBe(true);
    })


})