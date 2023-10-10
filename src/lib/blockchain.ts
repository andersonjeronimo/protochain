import Block from "./block";
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
    addBlock(block: Block): boolean {
        if (!block.isValid(
            this.blocks[this.blocks.length - 1].index,
            this.blocks[this.blocks.length - 1].hash,
        )) {
            return false
        };
        this.blocks.push(block);
        this.nextIndex++;
        return true;
    }

    /**
     * 
     * @returns Returns TRUE if the blockchain is valid
     */
    isValid(): boolean {
        for (let index = this.blocks.length - 1; index > 0; index--) {
            const currentBlock = this.blocks[index];
            const previousBlock = this.blocks[index - 1];
            const isValid = currentBlock.isValid(previousBlock.index, previousBlock.hash);
            if (!isValid) return false;
        }
        return true;
    }
}