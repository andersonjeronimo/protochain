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
        this.updateTxoHash();
    }

    /**
     * Updates each transaction output with the transaction reference hash
     */
    updateTxoHash(): void {
        //this.txOutputs.forEach((txo, index, arr) => { arr[index].txHash = this.hash });
        if (this.txOutputs.length) {
            this.txOutputs.forEach((txo) => { txo.currTxHash = this.hash });
        }
        //this.txOutputs.forEach(txo => txo.txHash = this.hash);
    }

    /**
     * 
     * @param privateKey Wallet private key from who is sending funds
     */
    signAllTxi(privateKey: string) {
        if (this.txInputs.length) {
            this.txInputs.forEach((txi) => { txi.sign(privateKey) });
        }
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
        if (this.txOutputs.some(txo => txo.currTxHash !== this.hash)) {
            return new Validation(false, "Invalid TXO reference hash");
        }
        //TODO: validar as taxas e recompensas quando tx.type === FEE
        return new Validation();
    }


    static fromUtxo(utxos: TransactionOutput[], fromWallet: string, toWallet: string, amount: number): Transaction {
        let tx = new Transaction({
            type: TransactionType.REGULAR
        } as Transaction);

        let debit = amount;
        let change = 0;
        let index = 0;
        do {
            const txo = utxos[index];
            const payment = txo.amount;
            if (payment <= debit) {
                tx.txInputs.push(new TransactionInput({
                    amount: payment,
                    fromAddress: fromWallet,
                    prevTxHash: txo.currTxHash
                } as TransactionInput));
                tx.txOutputs.push(new TransactionOutput({
                    amount: payment,
                    toAddress: toWallet,                    
                } as TransactionOutput));           
                
                debit = (debit - payment);
            }
            if (payment > debit) {
                change = payment - debit;
                tx.txInputs.push(new TransactionInput({
                    amount: debit,
                    fromAddress: fromWallet,
                    prevTxHash: txo.currTxHash
                } as TransactionInput));
                tx.txOutputs.push(new TransactionOutput({
                    amount: debit,
                    toAddress: toWallet,                   
                } as TransactionOutput));
                //CHANGE
                tx.txInputs.push(new TransactionInput({
                    amount: change,
                    fromAddress: fromWallet,
                    prevTxHash: txo.currTxHash
                } as TransactionInput));
                tx.txOutputs.push(new TransactionOutput({
                    amount: change,
                    toAddress: fromWallet,   
                } as TransactionOutput));
                
                debit = 0;
            }
            index++;
        } while (debit > 0);

        return tx;
    }
}