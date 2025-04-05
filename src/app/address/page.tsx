"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function Header() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [ balance, setBalance ] = useState(0);

    const getAirdropOnClick = async () => {
        try {
            if(!publicKey) {
                alert("Please connect your wallet first!");
                return;
            }
            const [lastestBlockhash, signature] = await Promise.all([
                connection.getLatestBlockhash(),
                connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL),
            ]);
            const sigResult = await connection.confirmTransaction(
                { signature, ...lastestBlockhash },
                "confirmed"
            );
            if (sigResult.value.err) {
                alert("Airdrop failed");
            } else {
                alert("Airdrop successful");
            }
        } catch (error) {
            console.error("Error during airdrop:", error);
            alert("Airdrop failed");
        }
    }

    useEffect(() => {
        if (publicKey) {
            (async function getBalnceEverySecond() {
                const newbalance = await connection.getBalance(publicKey);
                setBalance(newbalance / LAMPORTS_PER_SOL);
                setTimeout(getBalnceEverySecond, 1000);
            }
            )();
        }
    }, [publicKey, connection, balance, setBalance]);


return (
    <main className="flex min-h-screen flex-col items-center justify-evenly p-24">
        {publicKey ? (
            <div className="flex flex-col gap-4">
                <h1>Your Public key is: {publicKey?.toString()}</h1>
                <h1>Connected: {publicKey.toBase58()}</h1>
                <h1>Balance: {balance}</h1>
                <div>
                <button
                onClick={getAirdropOnClick}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                >
                Get Airdrop
                </button>
            </div>
        </div>
        ) : (
                <div>
                    <h1>Wallet is not connected</h1>
                    <WalletMultiButton />
                </div>
        )}
    </main>
  );
}