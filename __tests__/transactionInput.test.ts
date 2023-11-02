import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';
import Validation from '../src/lib/validation';

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
        let valid: Validation;
        if (alice.privateKey) {            
            txInput.sign(alice.privateKey);
        }
        valid = txInput.isValid();
        expect(valid.success).toBe(true);
    })

    it("Should NOT be valid (amount)", () => {
        const txInput = new TransactionInput({
            amount: 0,
            fromAddress: alice.publicKey
        } as TransactionInput);
        let valid: Validation;
        if (alice.privateKey) {            
            txInput.sign(alice.privateKey);
        }        
        valid = txInput.isValid();
        expect(valid.success).toBe(false);
    })

    it("Should NOT be valid (from address)", () => {
        const txInput = new TransactionInput({
            amount: 10            
        } as TransactionInput);
        let valid: Validation;
        if (alice.privateKey) {            
            txInput.sign(alice.privateKey);
        }        
        valid = txInput.isValid();
        expect(valid.success).toBe(false);
    })

    it("Should NOT be valid (invalid hash)", () => {
        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey
        } as TransactionInput);
        txInput.hash = undefined;
        let valid: Validation;
        if (alice.privateKey) {            
            txInput.sign(alice.privateKey);
        }        
        valid = txInput.isValid();
        expect(valid.success).toBe(false);
    })

    it("Should NOT be valid (not signed)", () => {
        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey
        } as TransactionInput);        
        const validation = txInput.isValid();
        expect(validation.success).toBe(false);
    })


})