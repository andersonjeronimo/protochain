import { SHA256 } from "crypto-js";
import Validation from "./validation";
/**
 * Block class
 */
export default class Block {
    index: number;
    timestamp: number;
    hash: string;
    previousHash: string;
    data: string;

    /**
     * Creates a new block
     * @param index The block index in blockchain     
     * @param previousHash The previous block hash
     * @param data The block data
     */
    constructor(index: number, previousHash: string, data: string) {
        this.index = index;
        this.timestamp = Date.now();
        this.previousHash = previousHash;
        this.data = data;
        this.hash = this.generateHash();
    }

    /**
     * @returns Generates the SHA256 block hash
     */
    generateHash(): string {
        let hashBase: string = "";
        Object.entries(this).forEach(
            ([key, value]) => {                
                hashBase = hashBase.concat(value);
            }      
        )
        return SHA256(hashBase).toString();
    }

    /**
     * 
     * @returns Returns TRUE if the block is valid
     */
    isValid(previousIndex: number, previousHash: string): Validation {
        if (previousIndex !== this.index-1) return new Validation(false, "Invalid index");
        if (this.timestamp < 1) return new Validation(false, "Invalid timestamp");
        if (this.previousHash !== previousHash) return new Validation(false, "Invalid previous hash");
        if (!this.data) return new Validation(false, "Invalid data");
        if (!this.hash) return new Validation(false, "Invalid hash (empty)");
        //if (this.hash !== this.generateHash()) return new Validation(false, "Invalid hash");
        return new Validation();
    }
}