import Block from "./block";
import Validation from "../validation";
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
        if (block.index < 0 ) {
            return new Validation(false, "Invalid mock block");
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
        return new Validation();
    }
}