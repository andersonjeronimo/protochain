import { SHA256 } from "crypto-js";
import TransactionType from "./transactionType";
import Validation from "./validation";
/**
 * Transaction class
 */
export default class Transaction {
    type: TransactionType;
    timestamp: number;
    hash: string;
    data: string;
    /**
     * 
     * @param tx Transaction object to construct the... 
     */
    constructor(tx?: Transaction) {
        this.type = tx?.type || TransactionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();
        this.data = tx?.data || "";
        this.hash = tx?.hash || this.generateHash();
    }

    /**
     * @returns Generates the SHA256 transaction hash
     */
    generateHash(): string {
        let hashBase: string = "";
        Object.entries(this).forEach(
            ([key, value]) => {
                if (key.toString() !== 'hash') {
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
        if (!this.data) return new Validation(false, "Invalid data (empty)");
        if (!this.hash) return new Validation(false, "Invalid hash (empty)");
        return new Validation();
    }
}