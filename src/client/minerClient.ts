import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import BlockInfo from '../lib/blockInfo';
import Block from '../lib/block';
import Wallet from '../lib/wallet';
import Transaction from '../lib/transaction';
import TransactionType from '../lib/transactionType';
import TransactionOutput from '../lib/transactionOutput';

const miner = new Wallet();

async function mine() {
    console.log("Coletando informações do próximo bloco...");
    const { data } = await axios.get(`${process.env.SERVER}blocks/next`);
    if (data.transactions.length === 0) {
        console.log(`Sem transações na Mempool...aguardando`);
        return setTimeout(() => {
            mine();
        }, 10000);
    }
    const blockInfo = data as BlockInfo;
    const newBlock = Block.fromBlockInfo(blockInfo);

    const txo = new TransactionOutput({
        toAddress: miner.publicKey,
        amount: 10,
    } as TransactionOutput);

    const tx = new Transaction({
        type: TransactionType.FEE
    } as Transaction);

    tx.txOutputs.push(txo);
    tx.hash = tx.generateHash();
    tx.updateTxoHash();

    newBlock.transactions.push(tx);

    console.log(`Iniciando mineração do bloco # ${newBlock.index}...`);
    console.log(`Dificuldade atual da rede: ${blockInfo.difficulty}`);

    newBlock.mine(blockInfo.difficulty, miner.publicKey!);

    console.log(`Bloco ${newBlock.hash} minerado com sucesso.`);
    try {
        await axios.post(`${process.env.SERVER}blocks/`, newBlock);
        console.log("Bloco aceito na rede blockchain.");
        console.log(`Total de bloco(s) até o momento: ${newBlock.index}`);
    } catch (error: any) {
        console.error(error.response ? error.response.data : error.message)
    }

    setTimeout(() => {
        mine();
    }, 10000);
}

mine();