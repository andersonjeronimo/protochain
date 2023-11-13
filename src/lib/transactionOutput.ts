import { SHA256 } from "crypto-js";
import Validation from "./validation";
/**
 * Transaction Output class
 */
export default class TransactionOutput {
    toAddress: string | undefined;
    amount: number;
    currTxHash: string | undefined;
    hash: string | undefined;

    constructor(txOutput?: TransactionOutput) {
        this.toAddress = txOutput?.toAddress || undefined;
        this.amount = txOutput?.amount || 0;
        this.currTxHash = txOutput?.currTxHash || undefined;
        this.hash = this.getHash();
    }

    /**
     * 
     * @returns The TXO hash
     */
    getHash() {
        if (this.toAddress && this.amount/*  && this.currTxHash */) {
            return SHA256(this.toAddress + this.amount/*  + this.currTxHash */).toString();
        }
        return undefined;
    }

    isValid(): Validation {
        if (this.amount < 1) {
            return new Validation(false, "Invalid amount (zero)");
        }
        if (this.hash !== this.getHash()) {
            return new Validation(false, "Invalid hash");
        }
        return new Validation();
    }

}