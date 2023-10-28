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
    fromAddress: string;
    amount: number;
    signature: string;
    /**
     * 
     * @param txInput 
     */
    constructor(txInput?: TransactionInput) {
        this.fromAddress = txInput?.fromAddress || "";
        this.amount = txInput?.amount || 0;
        this.signature = txInput?.signature || "";
    }
    /**
     * 
     * @param privateKey 
     */
    sign(privateKey: string): void {
        const privateKeyBuffer: Buffer = Buffer.from(privateKey, encoding);
        const keyPair: ECPairInterface = ECPair.fromPrivateKey(privateKeyBuffer);
        const hashBuffer: Buffer = Buffer.from(this.getHash(), encoding);

        this.signature = keyPair.sign(hashBuffer).toString(encoding);
    }
    /**
     * 
     * @returns 
     */
    getHash() {
        return SHA256(this.fromAddress + this.amount).toString();
    }
    /**
     * 
     * @returns 
     */
    isValid(): Validation {
        if (!this.signature) {
            return new Validation(false, "Signature is required");
        }
        if (this.amount < 1) {
            return new Validation(false, "Amount must be greater than zero");
        }

        const hashBuffer: Buffer = Buffer.from(this.getHash(), encoding);
        const publicKeyBuffer: Buffer = Buffer.from(this.fromAddress, encoding);
        const keyPair: ECPairInterface = ECPair.fromPublicKey(publicKeyBuffer);
        const signatureBuffer: Buffer = Buffer.from(this.signature, encoding);
        
        const isValid = keyPair.verify(hashBuffer, signatureBuffer);

        return isValid? new Validation() : new Validation(false, "Invalid tx input");
    }



}