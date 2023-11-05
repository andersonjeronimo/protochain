/**
 * Elliptic-curve cryptography (ECC) is an approach to public-key cryptography 
 * based on the algebraic structure of elliptic curves over finite fields.
 */
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { ECPairInterface } from 'ecpair/src/ecpair';
import { SHA256 } from 'crypto-js';
import Validation from './validation';

const ECPair = ECPairFactory(ecc);
const encoding = "hex";
/**
 * TransactionInput class
 */
export default class TransactionInput {
    fromAddress: string | undefined;
    amount: number;
    prevTxHash: string | undefined;
    signature: string | undefined;
    hash: string | undefined;
    /**
     * 
     * @param txInput 
     */
    constructor(txInput?: TransactionInput) {
        this.fromAddress = txInput?.fromAddress || undefined;
        this.amount = txInput?.amount || 0;
        this.prevTxHash = txInput?.prevTxHash || undefined;
        this.signature = txInput?.signature || undefined;
        this.hash = this.getHash();
    }
    /**
     * 
     * @param privateKey 
     */
    sign(privateKey: string): void {
        if (this.hash) {
            const privateKeyBuffer: Buffer = Buffer.from(privateKey, encoding);
            const keyPair: ECPairInterface = ECPair.fromPrivateKey(privateKeyBuffer);
            const hashBuffer: Buffer = Buffer.from(this.hash, encoding);
            this.signature = keyPair.sign(hashBuffer).toString(encoding);
        }
    }
    /**
     * 
     * @returns The TXI hash
     */
    getHash() {
        if (this.fromAddress && this.amount && this.prevTxHash) {
            return SHA256(this.fromAddress + this.amount + this.prevTxHash).toString();
        }
        return undefined;
    }
    /**
     * 
     * @returns 
     */
    isValid(): Validation {        
        if (!this.fromAddress) {
            return new Validation(false, "from wallet address is required");
        }
        if (this.amount < 1) {
            return new Validation(false, "Amount must be greater than zero");
        }
        if (!this.prevTxHash) {
            return new Validation(false, "Must have previous tx hash");
        }
        if (!this.hash) {
            return new Validation(false, "Cannot generate hash: fromAddress or/and amount undefined");
        }
        if (!this.signature) {
            return new Validation(false, "Cannot sign this input: invalid / empty fields");
        }
        const hashBuffer: Buffer = Buffer.from(this.hash, encoding);
        const publicKeyBuffer: Buffer = Buffer.from(this.fromAddress, encoding);
        const keyPair: ECPairInterface = ECPair.fromPublicKey(publicKeyBuffer);
        const signatureBuffer: Buffer = Buffer.from(this.signature, encoding);
        
        const isValid = keyPair.verify(hashBuffer, signatureBuffer);
        return isValid ? new Validation() : new Validation(false, "Invalid tx input");
    }



}