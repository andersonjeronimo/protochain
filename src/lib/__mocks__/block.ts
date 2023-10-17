//import { SHA256 } from "crypto-js";
import Validation from "../validation";
import BlockInfo from "../blockInfo";
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
     * 
     * @param block The block to be created
     */
    constructor(block?: Block) {
        this.index = block?.index || 0;
        this.timestamp = block?.timestamp || Date.now();
        this.previousHash = block?.previousHash || "";
        this.nonce = block?.nonce || 1;
        this.miner = block?.miner || "";
        this.data = block?.data || "";
        this.hash = block?.hash || this.generateHash();
    }

    /**
     * @returns Generates the SHA256 block hash
     */
    generateHash(): string {
        return "mock block hash";
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
        if (previousIndex !== (this.index - 1)) {
            return new Validation(false, "Invalid index");
        } else {
            return new Validation();
        }
    }

    /**
     * 
     * @param blockInfo Provided to miner to generate the next block
     * @param miner The miner wallet address
     * @returns The Blockinfo instance
     */
    static fromBlockInfo(blockInfo: BlockInfo, miner: string): Block {
        const block = new Block();
        block.index = blockInfo.index;
        block.previousHash = blockInfo.previousHash;
        block.data = blockInfo.data;
        block.miner = miner;
        return block;
    }
}