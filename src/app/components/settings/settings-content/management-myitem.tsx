import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react";
import './css/management-myitem.css';

interface Item {
    id: string;
    name: string;
    description: string;
    price: number;
    walletAddress: string;
    discountRate: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}

export default function Management_MyItem() {
    const { publicKey } = useWallet();
    const [myItems, setMyItems] = useState<Item[] | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/get-my-items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        WalletAddress: publicKey?.toString(),
                    }),
                });

                if (response.ok) {
                    const json = await response.json();
                    setMyItems(json.data); // Extract the 'data' array
                } else {
                    console.error('Failed to fetch data:', response.status);
                    setMyItems(null);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setMyItems(null);
            }
        }

        if (publicKey) {
            fetchData();
        }
    }, [publicKey]);

    return (
        <>
            <div className="management-myitem">
                <h1>My Item</h1>
                <p>Manage your items here.</p>
                {myItems ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myItems.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.description}</td>
                                    <td>{item.price}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.updatedAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No items found.</p>
                )}
            </div>
        </>
    )
}