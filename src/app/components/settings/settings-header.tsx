'use client'; // 클라이언트 컴포넌트임을 명시

import React, { useEffect, useState } from 'react';
import './css/settings-header.css';
import dynamic from 'next/dynamic'; // 1. dynamic import 추가

// 2. WalletMultiButton을 dynamic import로 불러오고 ssr: false 옵션 추가
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false } // 서버 사이드 렌더링 비활성화
);

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
            // content === 3 일 때 '주문 관리'가 중복됩니다. 의도된 것인지 확인해보세요.
            // 만약 다른 페이지라면 수정해야 합니다. (예: '문의 관리' 등)
            setPageOption('주문 관리');
        } else if (content === 4) {
            setPageOption('개발 테스트');
        }
    }, [content]); // useEffect의 종속성 배열에서 setPageOption 제거 가능 (React가 자동으로 처리)

    return (
        <>
            <div className="admin-header-box">
                <div className='page-option'>
                    {pageOption}
                </div>
                <div className='id-wallet'>
                    {/* 3. 기존 WalletMultiButton 대신 Dynamic 버전 사용 */}
                    <WalletMultiButtonDynamic />
                </div>
            </div>
        </>
    );
}