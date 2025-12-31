"use server";

import { ethers } from "ethers";
import { parseStringify } from "../utils";
import { createWeb3Account, getWeb3AccountsByUserId } from "./user.actions";

// Extend the Window interface to include ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

export const connectWeb3Wallet = async ({ userId }: { userId: string }) => {
    try {
        if (typeof window !== "undefined" && window.ethereum) {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();

            // Save the Web3 account to the database
            await createWeb3Account({ userId, address });

            return parseStringify({ success: true, address });
        } else {
            throw new Error("MetaMask not detected");
        }
    } catch (error) {
        console.error("An error occurred while connecting Web3 wallet:", error);
        return parseStringify({ success: false, error: (error as Error).message });
    }
};

export const getWeb3Accounts = async ({ userId }: { userId: string }) => {
    try {
        const accounts = await getWeb3AccountsByUserId({ userId });
        return parseStringify({ success: true, accounts });
    } catch (error) {
        console.error("An error occurred while getting Web3 accounts:", error);
        return parseStringify({ success: false, error: (error as Error).message });
    }
};

export const getWeb3Transactions = async ({ address }: { address: string }) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        const currentBlock = await provider.getBlockNumber();
        const transactions: ethers.providers.TransactionResponse[] = [];

        // Fetch transactions from the last 100 blocks (adjust as needed)
        for (let i = 0; i < 100; i++) {
            const block = await provider.getBlockWithTransactions(currentBlock - i);
            const blockTransactions = block.transactions.filter(
                tx => tx.from.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()
            );
            transactions.push(...blockTransactions);
        }

        const formattedTransactions = await Promise.all(transactions.map(async (tx) => {
            const block = await provider.getBlock(tx.blockHash);
            return {
                id: tx.hash,
                name: `Transaction ${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`,
                paymentChannel: "web3",
                type: tx.from.toLowerCase() === address.toLowerCase() ? "sent" : "received",
                accountId: address,
                amount: ethers.utils.formatEther(tx.value),
                pending: false,
                category: "Transfer",
                date: new Date(block.timestamp * 1000).toISOString(),
                image: "/ethereum-logo.png",
            };
        }));

        return parseStringify({ success: true, transactions: formattedTransactions });
    } catch (error) {
        console.error("An error occurred while getting Web3 transactions:", error);
        return parseStringify({ success: false, error: (error as Error).message });
    }
};
