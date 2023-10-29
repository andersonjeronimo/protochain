import { SHA256 } from "crypto-js";
import TransactionType from "./transactionType";
import Validation from "./validation";
import TransactionInput from "./transactionInput";
/**
 * Transaction class
 */
export default class Transaction {
    type: TransactionType;
    timestamp: number;
    hash: string;
    txInput: TransactionInput | undefined;
    toAddress: string | undefined;
    /**
     * 
     * @param tx Transaction object to construct the... 
     */
    constructor(tx?: Transaction) {
        this.type = tx?.type || TransactionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();
        this.toAddress = tx?.toAddress || undefined;
        this.hash = tx?.hash || this.generateHash();
        this.txInput = tx?.txInput ? new TransactionInput(tx.txInput) : undefined;
    }

    /**
     * @returns Generates the SHA256 transaction hash
     */
    generateHash(): string {
        let hashBase: string = "";
        Object.entries(this).forEach(
            ([key, value]) => {
                if (key.toString() !== 'hash' || key.toString() !== 'txInput') {
                    hashBase = hashBase.concat(value);
                }
            }
        )
        return SHA256(hashBase).toString();
    }

    /**
     * 
     * @returns Validation for object entries
     */
    isValid(): Validation {         
        if (!this.toAddress) return new Validation(false, "Invalid to address (empty)");
        if (!this.hash) return new Validation(false, "Invalid hash (empty)");
        if (this.txInput !== undefined) {
            const validation = this.txInput.isValid();
            if (!validation.success) 
            return new Validation(false, `Invalid Tx Input due: ${validation.message}`);
        }
        return new Validation();
    }
}