//import { SHA256 } from "crypto-js";
import Validation from "../validation";
/**
 * Block class
 */
export default class Block {
    index: number;
    timestamp: number;
    hash: string;
    previousHash: string;
    data: string;
    nonce: number;
    miner: string;
    /**
     * Creates a new block
     * @param index The block index in blockchain     
     * @param previousHash The previous block hash
     * @param data The block data
     */

    /**
     * Creates a new block
     * @param index The block index in blockchain     
     * @param previousHash The previous block hash
     * @param data The block transaction data
     * @param nonce The block nonce
     * @param miner The miner wallet address
     */
    constructor(index: number, previousHash: string, data: string, nonce: number, miner: string) {
        this.index = index;
        this.timestamp = Date.now();
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.miner = miner;
        this.data = data;
        this.hash = "";
        this.hash = this.generateHash();
    }

    /**
     * @returns Generates the SHA256 block hash
     */
    generateHash(): string {
        /* let hashBase: string = "";
        Object.entries(this).forEach(
            ([key, value]) => {
                if (key.toString() !== 'hash') {
                    hashBase = hashBase.concat(value);
                }
            }
        )
        return SHA256(hashBase).toString(); */
        return "moch-hash";
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
        if (previousIndex !== this.index - 1) return new Validation(false, "Invalid index");
        if (this.timestamp < 1) return new Validation(false, "Invalid timestamp");
        if (this.previousHash !== previousHash) return new Validation(false, "Invalid previous hash");
        if (!this.data) return new Validation(false, "Invalid data");
        if (!this.hash) return new Validation(false, "Invalid hash (empty)");
        if (!this.nonce || !this.miner) return new Validation(false, "Not mined");
        if (this.hash !== this.generateHash()) return new Validation(false, "Invalid hash");
        /* const prefix = this.getPrefix(difficulty);
        if (this.hash !== this.generateHash() || !this.hash.startsWith(prefix))
            return new Validation(false, "Invalid hash"); */

        return new Validation();
    }
}