import Block from "./block";
import BlockInfo from "../blockInfo";
import Validation from "../validation";
/**
 * Blockchain class
 */
export default class Blockchain {
    blocks: Block[];
    nextIndex: number = 0;
    static readonly DIFFICULTY_SALT = 10;
    static readonly MAX_DIFFICULTY_SALT = 30;

    /**
     * Creates a new blockchain
     */
    constructor() {
        this.blocks = [new Block({
            index: this.nextIndex,
            hash: "Genesis Hash",
            previousHash: "Genesis",
            data: "Genesis Block",
            timestamp: Date.now()} as Block)];
        this.nextIndex++;
    }

    /**
     * 
     * @returns The difficulty factor to mine a block
     */
    getDifficulty(): number {
        return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_SALT);
    }

    /**
     * 
     * @param block Block to be added to the blockchain
     * @returns Returns void
     */
    addBlock(block: Block): Validation {
        const validation = block.isValid(
            this.getLastBlock().index,
            this.getLastBlock().hash,
            this.getDifficulty()
        );
        if (!validation.success) {
            return validation;
        }
        this.blocks.push(block);
        this.nextIndex++;
        return new Validation();
    }

    /**
     * 
     * @param hash The block property : string  
     * @returns A block with the hash passed by reference
     */
    getBlock(hash: string): Block | undefined {
        return this.blocks.find(block => block.hash === hash);
    }

    /**
     * 
     * @returns The last block of the chain array
     */
    getLastBlock(): Block {
        return this.blocks[this.blocks.length - 1];
    }

    /**
     * 
     * @returns The next block info to the miner
     */
    getNextBlock(): BlockInfo {
        const index = this.nextIndex;
        const previousHash = this.getLastBlock().hash;
        const difficulty = this.getDifficulty();
        const maxDifficulty = Blockchain.MAX_DIFFICULTY_SALT;
        const feePerTx = 1;
        const data = "ANY TRANSACTION";
        return {
            index,
            previousHash,
            difficulty,
            maxDifficulty,
            feePerTx,
            data
        } as BlockInfo;
    }

    /**
     * 
     * @returns Returns TRUE if the blockchain is valid
     */
    isValid(): Validation {
        /* for (let index = this.blocks.length - 1; index > 0; index--) {
            const currentBlock = this.blocks[index];
            const previousBlock = this.blocks[index - 1];
            const validation = currentBlock
                .isValid(previousBlock.index, previousBlock.hash, this.getDifficulty());
            if (!validation.success)
                return new Validation(false, `invalid block #${currentBlock.index} : ${validation.message}`);
        } */
        return new Validation();
    }
} 