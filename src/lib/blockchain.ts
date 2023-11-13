import Block from "./block";
import BlockInfo from "./blockInfo";
import Transaction from "./transaction";
import TransactionInput from "./transactionInput";
import TransactionOutput from "./transactionOutput";
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
    constructor(miner: string) {
        this.mempool = [] as Transaction[]; //São obtidas nas wallets
        this.blockInfoCache = [] as BlockInfo[];
        this.blocks = [] as Block[];
        const genesis = this.genesisBlock(miner);
        this.blocks.push(genesis);
        this.nextIndex++;
    }
    /**
     * 
     * @param miner Blockchain node that will mine the block
     * @returns Mined genesis block
     */
    genesisBlock(miner: string): Block {
        const amount = 100;//TODO: calcular a recompensa
        const tx = new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput({
                amount: amount,
                toAddress: miner,
            } as TransactionOutput)]
        } as Transaction);
        tx.hash = tx.generateHash();
        tx.txOutputs.forEach(txo => txo.currTxHash = tx.hash);
        const block = new Block({
            index: this.nextIndex,
            previousHash: "Genesis",
            transactions: [new Transaction(tx)]
        } as Block);
        block.hash = block.generateHash();
        block.mine(this.getDifficulty(), miner);
        return block;
    }

    /**
     * 
     * @returns The difficulty factor to mine a block
     */
    getDifficulty(): number {
        return this.blocks.length < Blockchain.DIFFICULTY_FACTOR ?
            1 : Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR);
    }

    getFeePerTx(): number {
        return 1;
    }

    /**
     * 
     * @param block Block to be added to the blockchain
     * @returns Returns void
     */
    addBlock(block: Block): Validation {
        //Verificar se blockinfo já foi processado por outro minerador e excluído da lista 
        if (this.blockInfoCache.length === 0) {
            return new Validation(false, `Block # ${block.index} already accepted from another miner`);
        }

        const validation = block.isValid(
            this.getLastBlock().index,
            this.getLastBlock().hash!,
            this.getDifficulty()
        );
        if (!validation.success) return validation;

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
        //this.blockInfoCache = [] as BlockInfo[];
        this.blockInfoCache = this.blockInfoCache.filter(info => {
            info.index !== index;
        })
    }

    /**
     * Add a transaction to mempool
     * @param transaction To be included
     * @returns Validation success true | false
     */
    addTransaction(transaction: Transaction): Validation {
        if (transaction.txInputs && transaction.txInputs.length) {
            const fromAddress = transaction.txInputs[0].fromAddress;
            const pendingTx = this.mempool
                .map(tx => tx.txInputs)
                .flat()
                .filter(txi => txi.fromAddress === fromAddress);
            if (pendingTx && pendingTx.length) {
                return new Validation(false, "This wallet has a pending transaction");
            }

        }
        const validation = transaction.isValid();
        if (!validation.success) {
            return new Validation(false, `Invalid transaction: ${validation.message}`);
        }
        //TODO: avaliar a origem dos fundos (UTXO)
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
                [] as Transaction[]
        } as BlockInfo;
        /**
         * Armazena o blockInfo para comparar posteriormente se houve alteração
         * das transações através dos 'hashes'.
         */
        if (/* blockInfo.transactions.length > 0 &&  */this.blockInfoCache.length === 0) {
            this.blockInfoCache.push(blockInfo);
        }
        return blockInfo;
    }

    /**
     * https://river.com/learn/terms/u/unspent-transaction-output-utxo/
     * @param wallet The public key of the wallet
     * @returns Todas as TX outputs DESTINADAS a carteira cujo campo 'currentTxHash' não seja referenciado 
     * @returns no campo 'previousTxHash' de nenhuma TX input EMITIDA pela carteira,
     * @returns indicando que possuem o status 'UNSPENT' (UTXO)
     * 
     */
    getUtxo(wallet: string): TransactionOutput[] {
        let txs: Transaction[];
        let txis: TransactionInput[];
        let txos: TransactionOutput[];
        let utxos: TransactionOutput[];
        txs = this.blocks.map(b => b.transactions).flat();
        txos = txs.map(tx => tx.txOutputs).flat().filter(txo => {
            txo.toAddress === wallet;
        });
        txis = txs.map(tx => tx.txInputs).flat().filter(txi => {
            txi.fromAddress === wallet;
        });
        txis.forEach((txi, index, arr) => {
            let prevTxHash = arr[index].prevTxHash;
            txos.forEach((txo, index, arr) => {
                if (arr[index].currTxHash === prevTxHash) {
                    txos.splice(index, 1);
                }
            })
        })
        utxos = txos;
        return utxos;
    }
    
    /**
     * 
     * @param wallet The public key of the wallet
     * @returns The current balance from the wallet (all UTXO.amount sum)
     */
    getBalance(wallet: string): number {
        const utxo = this.getUtxo(wallet);
        const amounts = utxo.map(txo => txo.amount);
        const balance = amounts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        return balance;
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
                validation = currentBlock.isValid(previousBlock.index, previousBlock.hash!, this.getDifficulty());
                if (!validation.success) return validation;
            }
        }
        return new Validation();
    }
} 