'use client'
import React, { useEffect, useState } from 'react';
import './css/settings-header.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface AdminContentProps {
    content: number;
}

export default function Settings_Header({ content }: AdminContentProps) {
    const [pageOption, setPageOption] = useState('대시보드');

    useEffect(() => {
    if (content === 0) {
        setPageOption('대시보드');
    } else if (content === 1) {
        setPageOption('상품 관리');
    } else if (content === 2) {
        setPageOption('주문 관리');
    } else if (content === 3) {
        setPageOption('주문 관리');
    } else if (content === 4) {
        setPageOption('개발 테스트');
    }
    }, [content, setPageOption]);

    
    return (
        <>
            <div className="admin-header-box">
                <div className='page-option'>
                    {pageOption}
                </div>
                <div className='id-wallet'>
                    <WalletMultiButton />
                </div>
            </div>
        </>
    )
}