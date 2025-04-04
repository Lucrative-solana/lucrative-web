"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Header() {
  const { publicKey } = useWallet();

  return (
    <div>
      {publicKey ? (
        <p>Connected: {publicKey.toBase58()}</p>
      ) : (
        <WalletMultiButton />
      )}
    </div>
  );
}