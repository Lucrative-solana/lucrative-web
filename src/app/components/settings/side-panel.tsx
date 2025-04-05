'use client';
import { useEffect, useState } from 'react';
import './css/side-panel.css'
import { useRouter } from 'next/navigation';

interface SidePanelProps {
    setContent: (content: number) => void;
}

export default function SidePanel({ setContent }: SidePanelProps) {
    const [selmenu, setSelmenu] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as Element).closest('.a') || (e.target as Element).closest('.a-1') ||
                (e.target as Element).closest('.a-2') || (e.target as Element).closest('.a-3')
                || (e.target as Element).closest('.a-4');
            if (target) {
                let index;
                if (target.className.includes('a-')) {
                    index = parseInt(target.className.split('-')[1]);
                } else {
                    index = 0; // Default to 0 for 'a'
                }
                setSelmenu(index);
                setContent(index); 
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [setContent]);

    return (
        <>
            <div className='aside'>
                <div className='div' onClick={() => window.location.href = '/'}>
                    <div className='LOGO'>
                        LUCRATIVE
                    </div>
                </div>
                <div className={'nav'}>
                    <div className={`a ${selmenu === 0 ? 'selected' : ''}`}>
                        <div className={'span'}>
                            <div className={'text-'}>
                                대시보드
                            </div>
                        </div>
                    </div>
                    <div className={`a-1 ${selmenu === 1 ? 'selected' : ''}`}>
                        <div className={'span-1'}>
                            <div className={'text--'}>
                                상품 관리
                            </div>
                        </div>
                    </div>
                    <div className={`a-2 ${selmenu === 2 ? 'selected' : ''}`}>
                        <div className={'span-2'}>
                            <div className={'text---1'}>
                                주문 내역
                            </div>
                        </div>
                    </div>
                    <div className={`a-3 ${selmenu === 3 ? 'selected' : ''}`}>
                        <div className={'span-3'}>
                            <div className={'text---2'}>
                                토큰 분석
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}