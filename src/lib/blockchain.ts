import Block from "./block";
import BlockInfo from "./blockInfo";
import Transaction from "./transaction";
import TransactionType from "./transactionType";
import Validation from "./validation";
/**
 * Blockchain class
 */
export default class Blockchain {
    blocks: Block[];
    mempool: Transaction[];
    blockInfoCache: BlockInfo[];
    nextIndex: number = 0;
    static readonly DIFFICULTY_FACTOR = 10;
    static readonly MAX_DIFFICULTY_FACTOR = 50;
    static readonly TX_PER_BLOCK = 3;

    /**
     * Creates a new blockchain
     */
    constructor() {
        this.mempool = [] as Transaction[]; //São obtidas nas wallets
        this.blockInfoCache = [] as BlockInfo[];
        this.blocks = [new Block({
            index: this.nextIndex,
            hash: "Genesis Hash",
            previousHash: "Genesis",
            transactions: [
                new Transaction({
                    type: TransactionType.FEE
                } as Transaction)
            ] as Transaction[],
            timestamp: Date.now()
        } as Block)];
        this.nextIndex++;
    }

    /**
     * 
     * @returns The difficulty factor to mine a block
     */
    getDifficulty(): number {
        return this.blocks.length < Blockchain.DIFFICULTY_FACTOR ?
            1 : Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR);
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
        if (!validation.success) return validation;

        //Verificar se blockinfo já foi processado por outro minerador e excluído da lista 
        if (this.blockInfoCache.length === 0) {
            return new Validation(false, `Block # ${block.index} already accepted from another miner`);
        }
        const sentBlockInfo: BlockInfo = this.blockInfoCache[0];

        //Transações enviadas pela blockchain para mineradores
        const sentTxs = [] as string[];
        sentBlockInfo.transactions.forEach(tx => {
            if (tx.type !== TransactionType.FEE) {
                sentTxs.push(tx.hash);
            }
        });

        //Transações recebidas do minerador
        const receivedTxs = [] as string[];
        block.transactions.forEach(tx => {
            if (tx.type !== TransactionType.FEE) {
                receivedTxs.push(tx.hash);
            }
        });

        //Caso 1: recebeu menos transações do que foi enviado pela rede
        let missingTxs = [] as string[];
        missingTxs = sentTxs.filter(hash => !receivedTxs.includes(hash));
        if (missingTxs.length > 0)
            return new Validation(false, `Missing transactions in block# ${block.index}`);

        //Caso 2: recebeu mais transações do que foi enviado pela rede
        let unknownTxs = [] as string[];
        unknownTxs = receivedTxs.filter(hash => !sentTxs.includes(hash));
        if (unknownTxs.length > 0)
            return new Validation(false, `Unknown transactions in block# ${block.index}: ${unknownTxs[0]}`);

        //Se não há diferenças, entra para blockchain
        this.filterMempool(receivedTxs);
        this.filterblockInfoCache(block.index);
        this.blocks.push(block);
        this.nextIndex++;
        return new Validation(true, block.hash);
    }

    /**
     * 
     * @param hashes Array with transactions hashes of the block sent from miner
     */
    filterMempool(hashes: string[]) {
        this.mempool = this.mempool.filter(tx => {
            !hashes.includes(tx.hash);
        })
    }

    /**
     * 
     * @param index Index of the blockinfo to be removed
     */
    filterblockInfoCache(index: number) {
        this.blockInfoCache = [] as BlockInfo[];
    }

    /**
     * Add a transaction to mempool
     * @param transaction To be included
     * @returns Validation success true | false
     */
    addTransaction(transaction: Transaction) {
        const validation = transaction.isValid();
        if (!validation.success) {
            return new Validation(false, `Invalid transaction: ${validation.message}`);
        }
        this.mempool.push(new Transaction(transaction));
        return new Validation(true, transaction.hash);
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
        if (this.blockInfoCache.length > 0) {
            return this.blockInfoCache[0];
        }
        const index = this.nextIndex;
        const previousHash = this.getLastBlock().hash;
        const difficulty = this.getDifficulty();
        const maxDifficulty = Blockchain.MAX_DIFFICULTY_FACTOR;
        const feePerTx = 1;
        const mempoolTxs = this.mempool.length > 0 ?
            this.mempool.slice(0, Blockchain.TX_PER_BLOCK) as Transaction[] :
            [] as Transaction[];
        const blockInfo = {
            index,
            previousHash,
            difficulty,
            maxDifficulty,
            feePerTx,
            transactions: mempoolTxs.length > 0 ? mempoolTxs.map(tx => new Transaction(tx)) :
                mempoolTxs
        } as BlockInfo;
        /**
         * Armazena o blockInfo para comparar posteriormente se houve alteração
         * das transações através dos 'hashes'.
         */
        if (blockInfo.transactions.length > 0 && this.blockInfoCache.length === 0) {
            this.blockInfoCache.push(blockInfo);
        }
        return blockInfo;
    }

    /**
     * 
     * @returns Returns TRUE if the blockchain is valid
     */
    isValid(): Validation {
        if (this.blocks.length > 1) {
            let validation: Validation;
            for (let index = this.blocks.length - 1; index > 0; index--) {
                const currentBlock = this.blocks[index];
                const previousBlock = this.blocks[index - 1];
                validation = currentBlock.isValid(previousBlock.index, previousBlock.hash, this.getDifficulty());
                if (!validation.success) return validation;
            }
        }
        return new Validation();
    }
} 