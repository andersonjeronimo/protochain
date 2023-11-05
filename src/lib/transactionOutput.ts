import { SHA256 } from "crypto-js";
import Validation from "./validation";
/**
 * Transaction Output class
 */
export default class TransactionOutput {
    toAddress: string | undefined;
    amount: number | undefined;
    txHash: string | undefined;
    hash: string | undefined;

    constructor(txOutput?: TransactionOutput) {
        this.toAddress = txOutput?.toAddress;
        this.amount = txOutput?.amount;
        this.txHash = txOutput?.txHash;
        this.hash = this.getHash();
    }

    /**
     * 
     * @returns The TXO hash
     */
    getHash() {
        if (this.toAddress && this.amount && this.txHash) {
            return SHA256(this.toAddress + this.amount + this.txHash).toString();
        }
        return undefined;
    }

    isValid(): Validation {
        if (this.amount) {
            if (this.amount < 1) {
                return new Validation(false, "Invalid amount (zero)");
            }
        } else {
            return new Validation(false, "Invalid amount (undefined)");
        }
        return new Validation();
    }

}