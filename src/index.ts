import Block from "./lib/block";
import BlockInfo from "./lib/blockInfo";
import Blockchain from "./lib/blockchain";
import Transaction from "./lib/transaction";
import TransactionType from "./lib/transactionType";
import Wallet from "./lib/wallet";

const wallet = new Wallet();
const blockchain: Blockchain = new Blockchain(wallet.publicKey!);

blockchain.addTransaction(new Transaction({ type: TransactionType.FEE } as Transaction));
blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR } as Transaction));
blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR } as Transaction));

const blockInfo1: BlockInfo = blockchain.getNextBlock();

const block1: Block = Block.fromBlockInfo(blockInfo1);

//block1.transactions.push(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString(), hash: "later" } as Transaction));
//block1.transactions.pop();
block1.mine(1, wallet.publicKey!);

const validation1 = blockchain.addBlock(block1);

console.log(validation1.message);



/**
 * wallet: pubKey001
 * tx: hash_0002 
 * txi = [from: pubKey001, amount:10, prevTx: hash_genesis]
 * txo = [to: pubKey002, amount: 10, currTx: hash_002] 
 */

// Utxo = [to: pubKey002, amount: 10, currTx: hash_002]
// Utxo = [to: pubKey002, amount: 10, currTx: hash_003]
// Utxo = [to: pubKey002, amount: 10, currTx: hash_004]

/**
 * wallet: pubKey002
 * tx: hash_0005 
 * txi = [from: pubKey002, amount:5, prevTx: hash_002]
 * txo = [to: pubKey003, amount: 5, currTx: hash_003] 
 */
