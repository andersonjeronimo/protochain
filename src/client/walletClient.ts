import dotenv from 'dotenv';
dotenv.config();

import readline from 'readline';
import Wallet from "../lib/wallet";
import axios from 'axios';
import Transaction from '../lib/transaction';
import TransactionType from '../lib/transactionType';
import TransactionInput from '../lib/transactionInput';
import TransactionOutput from '../lib/transactionOutput';

const SERVER = process.env.SERVER;
const BTC_SIGN_UNICODE = '\u{20BF}';
const BTC = `${BTC_SIGN_UNICODE}TC`;
let myWalletPub: string | undefined;
let myWalletPriv: string | undefined;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

/**
 * Main function for client CLI (command line interface)
 */
function menu() {
    setTimeout(() => {
        console.clear();
        if (myWalletPub) {
            console.log('Wallet logged.');
            console.log(`Public Key # ${myWalletPub}`);
        } else console.log('Not logged')

        console.log("1 - Create wallet");
        console.log("2 - Recover wallet");
        console.log("3 - Balance");
        console.log("4 - Send tx");
        console.log("5 - Logout");
        console.log("6 - Quit");
        rl.question("Choose your option: ", (option) => {
            switch (option) {
                case "1": createWallet(); break;
                case "2": recoverWallet(); break;
                case "3": getBalance(); break;
                case "4": sendTx(); break;
                case "5": logout(); break;
                case "6": quit(); break;

                default: console.log("Wrong option");
                    menu();
            }
        })
    }, 1000);
}

function quit() {
    rl.question("Exit application? [Y/n]", (option) => {
        switch (option.toLowerCase()) {
            case "y": close(); break;
            case "n": menu(); break;
            default: close(); break;
        }
    });
}

function close() {
    rl.close();
}

function logout() {
    rl.question("Logout wallet? [Y/n]", (option) => {
        switch (option.toLowerCase()) {
            case "y": clearWallet(); break;
            case "n": menu(); break;
            default: clearWallet(); break;
        }
    });
}

function clearWallet() {
    myWalletPriv = undefined;
    myWalletPub = undefined;
    menu();
}

function preMenu(message: string) {
    rl.question(`${message}`, () => {
        setTimeout(() => {
            menu();
        }, 500);
    });
}

async function getBalance() {
    console.clear();
    if (!myWalletPub) {
        console.log("Not logged or don't have a wallet yet");
        return preMenu("Press any key to MAIN MENU");
    }

    const walletResp = await axios.get(`${SERVER}wallets/${myWalletPub}`);
    const balance = walletResp.data.balance as number;
    console.log(`Your current balance is ${balance} ${BTC}`);

    return preMenu("Press any key to MAIN MENU");
}

/**
 * 
 * @returns Transaction sent to mempool
 */
function sendTx() {
    console.clear();
    if (!myWalletPub) {
        console.log("Not logged or don't have a wallet yet");
        return preMenu("Press any key to MAIN MENU");
    }
    console.log(`Your wallet is ${myWalletPub}`);
    rl.question(`To wallet: `, (toWallet) => {
        if (toWallet.length < 66) {
            console.log(`Invalid wallet`);
            return preMenu("Press any key to MAIN MENU");
        }
        rl.question(`Amount? :`, async (amountStr) => {
            const amount = parseInt(amountStr);
            if (!amount) {
                console.log(`Invalid amount`);
                return preMenu("Press any key to MAIN MENU");
            }

            const walletResp = await axios.get(`${SERVER}wallets/${myWalletPub}`);
            const balance = walletResp.data.balance as number;
            const fee = walletResp.data.fee as number;
            const utxo = walletResp.data.utxo as TransactionOutput[];

            if (balance < amount + fee) {
                console.log(`Insufficient balance`);
                return preMenu("Press any key to MAIN MENU");
            }          

            //TODO: Balance validation
            //https://www.oreilly.com/library/view/mastering-bitcoin/9781491902639/ch05.html
            let tx = Transaction.fromUtxo(utxo, myWalletPub!, toWallet, amount);            
            
            tx.signAllTxi(myWalletPriv!);

            tx.hash = tx.generateHash();
            tx.updateTxoHash();
            //TODO: Gerar Tx type FEE

            try {
                const txResponse = await axios.post(`${SERVER}transactions/`, tx);
                console.log("Transaction accepted. Waiting miners");
                console.log(txResponse.data);
            } catch (error: any) {
                console.error(error.response ? error.response.data : error.message);
            }
            return preMenu("Transaction send with success. Press any key to MAIN MENU");
        })
    })
    preMenu("Press any key to MAIN MENU");
}

function createWallet() {
    console.clear();
    const wallet = new Wallet();
    myWalletPub = wallet.publicKey;
    myWalletPriv = wallet.privateKey;
    console.log("PRIVATE " + wallet.privateKey);
    console.log("PUBLIC " + wallet.publicKey);
    preMenu("Wallet created with success. Press any key to MAIN MENU");
}

function recoverWallet() {
    console.clear();
    rl.question("Type your private key or WIF: ", (keyOrWIF) => {
        myWalletPriv = undefined;
        myWalletPub = undefined;
        try {
            const wallet = new Wallet(keyOrWIF);
            myWalletPub = wallet.publicKey;
            myWalletPriv = wallet.privateKey;
            console.log("PRIVATE " + wallet.privateKey);
            console.log("PUBLIC " + wallet.publicKey);
            preMenu("Wallet recovered with success. Press any key to MAIN MENU");
        } catch (error) {
            preMenu(`${error}. Press any key to MAIN MENU`);
        }
    });
}

menu();
