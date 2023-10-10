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
        if (!validation.success) return new Validation(false, "Block invalid");
        this.blocks.push(block);
        this.nextIndex++;
        return new Validation();
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