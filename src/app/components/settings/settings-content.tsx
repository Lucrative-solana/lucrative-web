'use client'
import { useWallet } from '@solana/wallet-adapter-react';
import './css/settings_content.css'
import DashBoard from './settings-content/dashboard';
import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Management_MyItem from './settings-content/management-myitem';

interface AdminContentProps {
    content: number;
}


export default function Settings_Content({ content }: AdminContentProps) {
    const [walletstatus, setWalletStatus] = useState(false);
    const { wallet, publicKey } = useWallet();

    if (!walletstatus) {
        setWalletStatus(true);
    }
    console.log(walletstatus, wallet);
    let contentToRender;

    if (!publicKey) {
        contentToRender = (
            <div className="wallet-not-connected">
                <div className="wallet-not-connected-message">
                    월렛 연결 후 서비스 이용 가능합니다.
                    <div>
                        <WalletMultiButton />
                    </div>
                </div>

            </div>
        );
    } else {
        switch (content) {
            case 0:
                contentToRender = <DashBoard />;
                break;
            case 1:
                contentToRender = <Management_MyItem />;
                break;
            case 2:
                contentToRender = <div>Order Management</div>;
                break;
            case 3:
                contentToRender = <div>Token Analyze</div>;
                break;
            default:
                contentToRender = <div>Dashboard Cotent</div>;
                break;
        }
    }

    return (
        <div>
            <div className="admin-content">
                <div className="content-1">
                    {contentToRender}
                </div>
            </div>
        </div>
    )
}