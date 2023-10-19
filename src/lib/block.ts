import { SHA256 } from "crypto-js";
import Validation from "./validation";
import BlockInfo from "./blockInfo";
import Transaction from "./transaction";
import TransactionType from "./transactionType";
/**
 * Block class
 */
export default class Block {
    index: number;
    timestamp: number;
    hash: string;
    previousHash: string;
    transactions: Transaction[];
    nonce: number;
    miner: string;

    /**
     * Creates a new block
     * @param block The block to be created
     */
    constructor(block?: Block) {
        this.index = block?.index || 0;
        this.timestamp = block?.timestamp || Date.now();
        this.previousHash = block?.previousHash || "";
        this.nonce = block?.nonce || 1;
        this.miner = block?.miner || "";
        this.transactions = block?.transactions
            ? block?.transactions.map(tx => new Transaction(tx))
            : [] as Transaction[];
        this.hash = block?.hash || this.generateHash();
    }

    /**
     * 
     * @returns A string of all transactions hashes concatenation
     */
    generateTxHashBase(): string {
        let txHashBase = "";
        if (this.transactions.length > 0) {
            this.transactions.map(tx => txHashBase = txHashBase.concat(tx.hash))
        }
        return txHashBase;
    }

    /**
     * @returns Generates the SHA256 block hash
     */
    generateHash(): string {
        let hashBase: string = this.generateTxHashBase();
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
     * @param difficulty The difficulty factor to create a block
     * @returns The prefix for a valid block
     */
    getPrefix(difficulty: number) {
        return new Array(difficulty + 1).join("0");
    }

    /**
     * 
     * @param difficulty The difficulty factor to create a block
     */
    mine(difficulty: number) {
        const prefix = this.getPrefix(difficulty);
        if (!this.hash.startsWith(prefix)) {
            do {
                this.nonce++;
                this.hash = this.generateHash();
            } while (!this.hash.startsWith(prefix));
        }
    }

    /**
     * 
     * @param previousIndex The index of previous block of the blockchain
     * @param previousHash The hash of previous block of the blockchain
     * @param difficulty The difficulty factor to create a block
     * @returns Returns a validation if block is valid or not
     */
    isValid(previousIndex: number, previousHash: string, difficulty: number): Validation {
        if (this.transactions && this.transactions.length > 0) {
            if (this.transactions.filter(tx => tx.type === TransactionType.FEE).length > 1) {
                const message = "Must have only one fee transaction type per block";
                return new Validation(false, message);
            }
            const validations: Validation[] = this.transactions.map(tx => tx.isValid());
            const errors = validations.filter(v => !v.success).map(v => v.message);
            if (errors.length > 0) {
                const message = errors.join(", ");
                return new Validation(false, message);
            }
        }
        if (previousIndex !== this.index - 1) return new Validation(false, "Invalid index");
        if (this.timestamp < 1) return new Validation(false, "Invalid timestamp");
        if (this.previousHash !== previousHash) return new Validation(false, "Invalid previous hash");
        if (!this.hash) return new Validation(false, "Invalid hash (empty)");
        if (this.nonce < 0 || !this.miner) return new Validation(false, "Not mined");
        const prefix = this.getPrefix(difficulty);
        if (!this.hash.startsWith(prefix))
            return new Validation(false, "Invalid hash prefix");
        return new Validation();
    }

    /**
     * 
     * @param blockInfo Provided to miner to generate the next block
     * @param miner The wallet address
     * @returns The Blockinfo instance
     */
    static fromBlockInfo(blockInfo: BlockInfo, miner: string): Block {
        const block = new Block();
        block.index = blockInfo.index;
        block.previousHash = blockInfo.previousHash;
        block.transactions = blockInfo.transactions;
        block.miner = miner;
        return block;
    }
}