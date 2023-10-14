import Block from "./block";
import Validation from "./validation";
/**
 * Blockchain class
 */
export default class Blockchain {
    blocks: Block[];
    nextIndex: number = 0;

    /**
     * Creates a new blockchain
     */
    constructor() {
        this.blocks = [new Block(this.nextIndex, '', 'Genesis Block')];
        this.nextIndex++;
    }

    /**
     * 
     * @param block Block to be added to the blockchain
     * @returns Returns void
     */
    addBlock(block: Block): Validation {
        const validation = block.isValid(
            this.blocks[this.blocks.length - 1].index,
            this.blocks[this.blocks.length - 1].hash,
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
     * @param data Data used to create a new block and add it to the blockchain
     * @returns A validation success | error
     */
    addBlockByData(data: string): Validation {
        const block = new Block(this.nextIndex, this.blocks[this.nextIndex - 1].hash, data);
        const validation = block.isValid(block.index - 1, this.blocks[block.index - 1].hash);
        if (validation.success) {
            this.blocks.push(block);
            this.nextIndex++;
            return new Validation(true, block.hash);
        } else {            
            return validation;
        }
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
     * @returns Returns TRUE if the blockchain is valid
     */
    isValid(): Validation {
        for (let index = this.blocks.length - 1; index > 0; index--) {
            const currentBlock = this.blocks[index];
            const previousBlock = this.blocks[index - 1];
            const validation = currentBlock.isValid(previousBlock.index, previousBlock.hash);
            if (!validation.success)
                return new Validation(false, `invalid block #${currentBlock.index} : ${validation.message}`);
        }
        return new Validation();
    }
} 