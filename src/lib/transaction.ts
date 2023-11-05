import { SHA256 } from "crypto-js";
import TransactionType from "./transactionType";
import Validation from "./validation";
import TransactionInput from "./transactionInput";
import TransactionOutput from "./transactionOutput";
/**
 * Transaction class
 */
export default class Transaction {
    type: TransactionType;
    timestamp: number;
    hash: string;
    txInputs: TransactionInput[];
    txOutputs: TransactionOutput[];
    /**
     * 
     * @param tx Transaction object to construct the... 
     */
    constructor(tx?: Transaction) {
        this.type = tx?.type || TransactionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();
        this.txInputs = tx?.txInputs ?
            tx.txInputs.map(txi => new TransactionInput(txi))
            : [] as TransactionInput[];
        this.txOutputs = tx?.txOutputs ?
            tx.txOutputs.map(txo => new TransactionOutput(txo))
            : [] as TransactionOutput[];
        this.hash = tx?.hash || this.generateHash();
        //update txos hash
        //this.txOutputs.forEach((txo, index, arr) => { arr[index].txHash = this.hash });
        //this.txOutputs.forEach((txo) => { txo.txHash = this.hash });
        this.txOutputs.forEach(txo => txo.txHash = this.hash);
    }

    /**
     * 
     * @returns A string of all transactions hashes concatenation
     */
    generateTxHashBase(): string {
        let txHashBase = "";
        if (this.txInputs.length > 0) {
            this.txInputs.map(txi => {
                txHashBase = txi.hash ? txHashBase.concat(txi.hash) : "";
            })
        }
        if (this.txOutputs.length > 0) {
            this.txOutputs.map(txo => {
                txHashBase = txo.hash ? txHashBase.concat(txo.hash) : "";
            })
        }
        return txHashBase;
    }

    /**
     * @returns Generates the SHA256 transaction hash
     */
    generateHash(): string {
        let hashBase: string = this.generateTxHashBase();
        Object.entries(this).forEach(
            ([key, value]) => {
                if (key.toString() !== 'hash'
                    || key.toString() !== 'txInputs'
                    || key.toString() !== 'txOutputs') {
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
        if (!this.hash) return new Validation(false, "Invalid hash (empty)");
        if (this.txInputs.length > 0) {
            const validations: Validation[] = this.txInputs.map(
                (txi) => new TransactionInput(txi).isValid());
            const errors = validations.filter(v => !v.success).map(v => v.message);
            if (errors.length > 0) {
                const message = errors.join(", ");
                return new Validation(false, message);
            }
        }
        if (this.txOutputs.length > 0) {
            const validations: Validation[] = this.txOutputs.map(
                (txo) => new TransactionOutput(txo).isValid());
            const errors = validations.filter(v => !v.success).map(v => v.message);
            if (errors.length > 0) {
                const message = errors.join(", ");
                return new Validation(false, message);
            }
        }
        return new Validation();
    }
}