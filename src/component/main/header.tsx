'use client' // 이 지시문은 솔라나 이용에 필수입니다 
import React from 'react';
import './css/header.css';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Main_Header() {
    return (
    <div className={'header'}>
        <div className={'nav'}>
            <div className={'div'}>
                <div className={'div-1'}>
                    <div className={'a'}>
                        <div className={'img'}>
                        </div>
                    </div>
                    <div className={'div-2'}>
                        <div className={'a-1'}>
                            <div className={'text-'}>
                                홈
                            </div>
                        </div>
                        <div className={'a-2'}>
                            <div className={'text--1'}>
                                상품
                            </div>
                        </div>
                        <div className={'a-3'}>
                            <div className={'text--2'}>
                                마이페이지
                            </div>
                        </div>
                        <div className={'a-4'}>
                            <div className={'text--3'}>
                                판매자
                            </div>
                        </div>
                    </div>
                </div>
                <div className={'div-3'}>
                    <div className={'button'}>
                        <svg id="1:104" className={'svg'}></svg>
                        <div className={'text--'}>
                                <WalletMultiButton style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    content: 'center',
                                    display: 'flex',
                                }}  />
                            </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}