'use client';
import React, { useEffect, useState } from 'react';
import './css/header.css';

const WalletMultiButtonComponent = React.lazy(() =>
    import('@solana/wallet-adapter-react-ui').then((module) => ({
        default: module.WalletMultiButton,
    }))
);

export default function Main_Header() {
    const [isClient, setIsClient] = useState(false);


    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className={'header'}>
            <div className={'nav'}>
                <div className={'div'}>
                    <div className={'div-1'}>
                        <div className={'a'}>
                            <div className={'img'}></div>
                        </div>
                        <div className={'div-2'}>
                            <div className={'a-1'}>
                                <div className={'text-'}>홈</div>
                            </div>
                            <div className={'a-2'}>
                                <div className={'text--1'} onClick={() => window.location.href = '/search'}>상품</div>
                            </div>
                            <div className={'a-3'} onClick={() => window.location.href = '/settings'} >
                                <div className={'text--2'}>마이페이지</div>
                            </div>
                        </div>
                    </div>
                    <div className={'div-3'}>
                        {isClient ? (
                            <React.Suspense fallback={<>Loading...</>}>
                                <WalletMultiButtonComponent
                                    style={{
                                        backgroundColor: 'black',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        content: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: 'auto',
                                        height: '34px',
                                    }}
                                />
                            </React.Suspense>
                        ) : (
                            <>지갑 연결</>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}