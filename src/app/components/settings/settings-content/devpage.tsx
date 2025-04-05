'use client';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useEffect, useState } from "react";
import './css/devpage.css';

export default function Admin_DevPage() {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState(0);
    const [widhrawAddress, setWithdrawAddress] = useState('');
    const [widhrawAmount, setWithdrawAmount] = useState(0);

    const onChangeAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWithdrawAddress(e.target.value);
    }
    const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWithdrawAmount(Number(e.target.value));
    }

    useEffect(() => {
        console.log('widhtraw address', widhrawAddress);
        console.log('widhtraw amount', widhrawAmount);
    }, [widhrawAddress, widhrawAmount]);


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

    const buysendwidhraw = async () => {
        if (!publicKey) {
            console.error("Public key is null");
            return;
        }
        try {
            const mywallet = publicKey;
            const recipient = new PublicKey(widhrawAddress);
            const lamports = widhrawAmount * 1e9; // 0.01 SOL in lamports
    
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: mywallet,
                    toPubkey: recipient,
                    lamports,
                })
            )

            const signature = await sendTransaction(transaction, connection);
            console.log('Transaction signature:', signature);
            return true;
        } catch (error) {
            console.error("Error sending transaction:", error);
        }
    }



    const onSubmit = async () => {
        const confirmWithdraw = window.confirm(
            '송금 테스트를 진행하시겠습니까?\n' +
            '주소: ' + widhrawAddress + '\n' +
            '수량: ' + widhrawAmount + '\n' +
            '진행하시려면 "확인"을, 취소하시려면 "취소"를 눌러주세요.'
        );

        if (confirmWithdraw) {
            alert('송금을 진행합니다!');
            const transactionResult = await buysendwidhraw();
            if (transactionResult === true) {
                await fetch('/api/dev/widhdraw', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        buyer: publicKey?.toString(),
                        seller: widhrawAddress,
                        amountInSol: widhrawAmount,
                        itemName: "Test crabfood",
                        itemId: "1",
                        itemDescription: "Test"
                    }),
                })
                    .then((response) => {
                        console.log('Response:', response);
                        if (response.ok) {
                            alert('송금이 완료되었습니다.');
                        } else {
                            alert('송금에 실패했습니다.');
                        }
                    })
                // 여기에 실제 송금 로직을 구현합니다.
            } else {
                alert('오류가 발생하여 송금을 취소합니다.');
            }
        }
    }
    
    return (
        <>
            <div className="content">
                <div className="content-1">
                    <h1>DevPage</h1>
                    <p>Welcome to the DevPage!</p>
                </div>
                <div className="content-2">
                    <div className="my-wallet-box">
                        <h1>My Wallet</h1>
                        <h1>Your Public key is: {publicKey?.toString()}</h1>
                        <h1>Connected: {publicKey?.toBase58()}</h1>
                        <h1>Balance: {balance}</h1>
                    </div>
                    <div className="widhraw-box">
                        <h1>송금 테스트</h1>
                        <div>
                            셀러 주소
                        </div>
                        <div className="widhraw-input-box">
                            <input id="address-input" placeholder="Recipient Address" onChange={onChangeAddress} />
                        </div>
                        <div className="widhtraw-count-text">
                            수량
                        </div>
                        <div className="widhraw-input-box">
                            <input id="address-input" placeholder="Amount" onChange={onChangeAmount} />
                        </div>
                        <div className="widhraw-button-box">
                            <div className="widhraw-button" onClick={onSubmit}>
                                셀러 테스트
                            </div>
                        </div>
                        </div>
                    <div>
                    </div>
                </div>
            </div>
        </>
    )
}