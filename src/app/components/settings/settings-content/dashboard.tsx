'use client'
import React, { useEffect, useState } from 'react';
import './css/dashboard.css' // CSS 파일 임포트 확인
import { LAMPORTS_PER_SOL, VersionedTransactionResponse } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, // Chart 중복 방지
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // <<< Filler 임포트
} from 'chart.js';
import type { ChartOptions, ChartData, TooltipItem } from 'chart.js'; // <<< 타입 임포트
import ProductRegistrationForm from './add-product';

ChartJS.register( // ChartJS 사용
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // <<< Filler 등록
);

// ChartData 타입 정의 (TypeScript 사용 시)
type LineChartData = ChartData<'line', number[], string>;

export default function DashBoard() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState(0);
    const [solPrice, setSolPrice] = useState(0);
    // 최근 5개 트랜잭션만 저장하도록 수정
    const [transactions, setTransactions] = useState<(VersionedTransactionResponse | null)[]>([]);
    const [todayTransactionCount, setTodayTransactionCount] = useState(0);

    // 차트 데이터 상태 (타입 명시)
    const [chartData, setChartData] = useState<LineChartData | null>(null);
    const [loadingChart, setLoadingChart] = useState(true);
    const [chartError, setChartError] = useState<string | null>(null);

    // 주문 데이터 상태
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    const [viewMode, setViewMode] = useState<'dashboard' | 'register'>('dashboard'); // 현재 보여줄 뷰 상태

    // --- 상품 등록 폼으로 전환하는 함수 ---
    const showRegistrationForm = () => {
        setViewMode('register');
    };

    // --- 대시보드로 돌아가는 함수 ---
    const showDashboard = () => {
        setViewMode('dashboard');
    };

    interface Order {
    id: string | number; // 고유 ID
    buyer: string;
    productName: string;
    quantity: number;
    amount: string; // 예: "0.5 ETH"
    status: '완료' | '진행중' | '취소'; // 상태 타입 제한
}

    // 샘플 주문 데이터 (실제로는 API 호출 등을 통해 가져옵니다)
    const sampleOrders: Order[] = [
        { id: 1, buyer: '이민수', productName: '디지털 아트 #1234', quantity: 1, amount: '0.5 ETH', status: '완료' },
        { id: 2, buyer: '박지영', productName: '컬렉션 아이템 #789', quantity: 2, amount: '0.8 ETH', status: '진행중' },
        { id: 3, buyer: '김철수', productName: '특별판 NFT', quantity: 1, amount: '1.2 ETH', status: '완료' },
    // ... 더 많은 주문 데이터
    ];


    // --- 잔액 가져오기 useEffect ---
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        if (publicKey) {
            const getBalance = async () => {
                try {
                    const newbalance = await connection.getBalance(publicKey);
                    setBalance(newbalance / LAMPORTS_PER_SOL);
                    timeoutId = setTimeout(getBalance, 5000); // 5초마다 업데이트
                } catch (error) {
                    console.error("Error fetching balance:", error);
                    timeoutId = setTimeout(getBalance, 10000); // 에러 시 10초 후 재시도
                }
            };
            getBalance();
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [publicKey, connection]);

    // --- 현재가 가져오기 useEffect ---
    useEffect(() => {
        async function fetchSolPrice() {
             try {
                 const response = await fetch(
                     'https://api.upbit.com/v1/ticker?markets=KRW-SOL',
                     { method: 'GET', headers: { 'Accept': 'application/json' } }
                 );
                 if (!response.ok) throw new Error('Network response was not ok');
                 const data = await response.json();
                 if (data && data.length > 0) {
                     setSolPrice(data[0].trade_price);
                 }
             } catch (error) {
                 console.error("솔라나 현재 가격을 가져오는 데 실패했습니다.", error);
             }
         }
         fetchSolPrice();
         const intervalId = setInterval(fetchSolPrice, 60000);
         return () => clearInterval(intervalId);
     }, []);

    // --- 트랜잭션 가져오기 useEffect ---
     useEffect(() => {
         async function fetchTransactionsAndCount() {
             if (!publicKey) return;
             try {
                 const signatureInfo = await connection.getSignaturesForAddress(publicKey, {
                     limit: 100, // 카운트를 위해 충분히 가져옴
                 });

                 const today = new Date();
                 const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000;

                 let todayCount = 0;
                 const transactionDetailsPromises = signatureInfo.map(async (signature) => {
                     const transaction = await connection.getTransaction(signature.signature, {
                         commitment: "confirmed",
                         maxSupportedTransactionVersion: 0,
                     });
                     if (transaction?.blockTime && transaction.blockTime >= todayStart) {
                         todayCount++;
                     }
                     return transaction;
                 });

                 const allTransactionDetails = await Promise.all(transactionDetailsPromises);
                 // 최근 5개만 상태 저장
                 setTransactions(allTransactionDetails.slice(0, 5));
                 setTodayTransactionCount(todayCount);

             } catch (error) {
                 console.error("트랜잭션 가져오기 오류:", error);
             }
         }
         fetchTransactionsAndCount();
     }, [publicKey, connection]);
    
    
    

    // --- 차트 데이터 가져오기 useEffect ---
    useEffect(() => {
        async function fetchChartData() {
            setLoadingChart(true);
            setChartError(null);
            try {
                const response = await fetch(
                    'https://api.upbit.com/v1/candles/minutes/60?market=KRW-SOL&count=24',
                    { method: 'GET', headers: { 'Accept': 'application/json' } }
                );
                if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
                interface CandleData {
                    candle_date_time_kst: string;
                    trade_price: number;
                }
                const candleData: CandleData[] = await response.json(); // API 응답 타입 명시

                if (!candleData || candleData.length === 0) {
                    throw new Error("No chart data received from API");
                }

                const reversedData = candleData.reverse();

                const labels = reversedData.map(candle => {
                    const date = new Date(candle.candle_date_time_kst);
                    return `${date.getHours().toString().padStart(2, '0')}:00`;
                });
                const prices = reversedData.map(candle => candle.trade_price);

                // <<< 데이터셋 스타일 수정 (목표 이미지 기반) >>>
                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'SOL/KRW', // 레이블
                            data: prices,
                            borderColor: '#8884d8', // 라인 색상 (보라색 계열)
                            backgroundColor: 'rgba(136, 132, 216, 0.1)', // 라인 아래 채우기 색상
                            fill: true, // <<< 라인 아래 영역 채우기 활성화
                            tension: 0.4, // <<< 라인 부드럽게
                            pointRadius: 3, // <<< 데이터 포인트 크기
                            pointBackgroundColor: '#8884d8', // 포인트 내부 색
                            pointBorderColor: '#8884d8', // 포인트 테두리 색
                            pointHoverRadius: 5, // 호버 시 포인트 크기
                            pointHoverBackgroundColor: '#8884d8', // 호버 시 포인트 내부 색
                        },
                    ],
                });

            } catch (error: unknown) { // 에러 타입 명시
                console.error("솔라나 시세 차트 데이터를 가져오는 데 실패했습니다.", error);
                setChartError(error instanceof Error ? error.message : "차트 데이터를 불러오지 못했습니다.");
            } finally {
                setLoadingChart(false);
            }
        }

        fetchChartData();
    }, []);

    // <<< 차트 옵션 수정 (목표 이미지 기반) (타입 명시) >>>
    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // 범례 숨김
            },
            title: {
                display: false, // 제목 숨김
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 10,
                cornerRadius: 4,
                mode: 'index',
                intersect: false,
                callbacks: {
                    // 툴팁 레이블에서 화폐 단위 제거 (숫자만 표시)
                    label: (context: TooltipItem<'line'>) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toLocaleString(); // 숫자만
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'category', // 타입 명시
                grid: {
                    display: false, // 세로 그리드 숨김
                },
                border: {
                    display: false, // X축 선 숨김
                },
                ticks: {
                    color: '#888', // X축 레이블 색상
                    font: { size: 10 },
                    maxRotation: 0, // 레이블 회전 방지
                    autoSkip: true, // 자동으로 레이블 건너뛰기
                    maxTicksLimit: 6 // 최대 표시 레이블 수 (예: 00, 04, 08 ...)
                }
            },
            y: {
                type: 'linear', // 타입 명시
                grid: {
                    display: true, // 가로 그리드 표시
                    color: '#e0e0e0', // 그리드 색상
                    // Removed invalid property 'borderWidth'
                },
                border: {
                    display: false, // Y축 선 숨김
                },
                ticks: {
                    color: '#888', // Y축 레이블 색상
                    font: { size: 10 },
                    // Y축 레이블에서 화폐 단위 제거
                    callback: (tickValue: string | number) => {
                        if (typeof tickValue === 'number') {
                            return tickValue.toLocaleString(); // 숫자만
                        }
                        return tickValue;
                    },
                    stepSize: 50 // Y축 눈금 간격
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };


    return (
        <div>
            {viewMode === 'dashboard' ? (
                <div className='main'>
                    {/* 정보 박스 영역 */}
                    <div className='info-box'>
                        {/* ... 기존 info-detail-box 들 ... */}
                        <div className='info-detail-box'>
                            <div className={'div-1'}><div className={'today-earn-text'}>오늘 수익</div></div>
                            <div className={'div-2'}><div className={'today-earn-text-2'}>2.45 ETH</div></div>
                            <div className={'div-3'}><div className={'today-earn-text-3'}>₩4,890,000</div></div>
                        </div>
                        <div className='info-detail-box'>
                            <div className={'div-1'}><div className={'total-sell-text'}>누적 판매량</div></div>
                            <div className={'div-2'}><div className={'total-sell-text-2'}>1,234</div></div>
                            <div className={'div-3'}><div className={'total-sell-text-3'}>+12.5%</div></div>
                        </div>
                        <div className='info-detail-box'>
                            <div className={'div-1'}><div className={'amount-token-text'}>보유 토큰</div></div>
                            <div className={'div-2'}><div className={'amount-token-text-2'}>{balance.toFixed(2)} SOL</div></div>
                            <div className={'div-3'}><div className={'amount-token-text-3'}>₩{solPrice > 0 ? (balance * solPrice).toLocaleString() : '...'}</div></div>
                        </div>
                        <div className='info-detail-box'>
                            <div className={'div-1'}><div className={'amount-token-text'}>오늘 트랜잭션 수</div></div>
                            <div className={'div-2'}><div className={'amount-token-text-2'}>{todayTransactionCount} 건</div></div>
                        </div>
                    </div>


                    <div className='content-row'> {/* 차트와 트랜잭션 목록을 담는 행 */}
                        {/* 토큰 시세 차트 */}
                        <div className='chart-box'> {/* 차트 전체 박스 */}
                            <h3 className='chart-title'>토큰 시세</h3> {/* 제목 */}
                            <div className='chart-container'> {/* 차트 캔버스 컨테이너 */}
                                {loadingChart && <div className="loading-placeholder"><span>차트 로딩 중...</span></div>}
                                {chartError && <div className="error-placeholder"><span>{chartError}</span></div>}
                                {/* chartData가 null이 아닐 때만 Line 렌더링 */}
                                {!loadingChart && !chartError && chartData && (
                                    <Line options={chartOptions} data={chartData} />
                                )}
                            </div>
                        </div>
                        {/* 최근 트랜잭션 목록 (이전 답변 참고하여 추가) */}
                        <div className='transaction-list-box'>
                            <h3 className='transaction-title'>최근 트랜잭션</h3>
                            {transactions.length > 0 ? (
                                <ul className='transaction-list'>
                                    {transactions.map((tx, index) => (
                                        <li key={tx?.transaction.signatures[0] || index} className="transaction-item">
                                            <div className="tx-signature">
                                                Sig: {tx?.transaction.signatures[0] ? `${tx.transaction.signatures[0].substring(0, 10)}...${tx.transaction.signatures[0].substring(tx.transaction.signatures[0].length - 5)}` : 'N/A'}
                                            </div>
                                            <div className="tx-time">
                                                Time: {tx?.blockTime ? new Date(tx.blockTime * 1000).toLocaleTimeString('ko-KR') : 'N/A'}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-transactions">최근 트랜잭션이 없습니다.</p>
                            )}
                        </div>
                    </div>

                    <div className='recent-order-view-box'>
                        <div className='recent-orders'>
                            <div className='recent-orders__header'>
                                <h3 className='recent-orders__title-wrapper'>
                                    <span className='recent-orders__title'>최근 주문</span>
                                </h3>
                            </div>
                            <div className='recent-orders__content'>
                                <div className='recent-orders__table'>
                                    <div className='recent-orders__thead'>
                                        <div className='recent-orders__row recent-orders__row--header'>
                                            <div className='recent-orders__cell recent-orders__cell--header recent-orders__cell--buyer'>
                                                <span className='recent-orders__header-text'>구매자</span>
                                            </div>
                                            <div className='recent-orders__cell recent-orders__cell--header recent-orders__cell--product'>
                                                <span className='recent-orders__header-text'>상품명</span>
                                            </div>
                                            <div className='recent-orders__cell recent-orders__cell--header recent-orders__cell--quantity'>
                                                <span className='recent-orders__header-text'>수량</span>
                                            </div>
                                            <div className='recent-orders__cell recent-orders__cell--header recent-orders__cell--amount'>
                                                <span className='recent-orders__header-text'>결제금액</span>
                                            </div>
                                            <div className='recent-orders__cell recent-orders__cell--header recent-orders__cell--status'>
                                                <span className='recent-orders__header-text'>상태</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='recent-orders__tbody'>
                                        {orders.length === 0 ? (
                                            <div className="recent-orders__row recent-orders__row--empty">
                                                <div className="recent-orders__cell recent-orders__cell--empty" role="cell" aria-colspan={5}>
                                                    최근 주문 내역이 없습니다.
                                                </div>
                                            </div>
                                        ) : (
                                            orders.map((order) => (
                                                <div className='recent-orders__row' key={order.id}>
                                                    <div className='recent-orders__cell recent-orders__cell--buyer'>
                                                        <span className='recent-orders__cell-content'>{order.buyer}</span>
                                                    </div>
                                                    <div className='recent-orders__cell recent-orders__cell--product'>
                                                        <span className='recent-orders__cell-content'>{order.productName}</span>
                                                    </div>
                                                    <div className='recent-orders__cell recent-orders__cell--quantity'>
                                                        <span className='recent-orders__cell-content'>{order.quantity}</span>
                                                    </div>
                                                    <div className='recent-orders__cell recent-orders__cell--amount'>
                                                        <span className='recent-orders__cell-content'>{order.amount}</span>
                                                    </div>
                                                    <div className='recent-orders__cell recent-orders__cell--status'>
                                                        <span className={`recent-orders__status-badge status-${order.status === '완료' ? 'completed' : order.status === '진행중' ? 'pending' : 'cancelled'}`}>
                                                            <span className='recent-orders__status-text'>{order.status}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='additional-options-box'>
                        <div className={'view-report-button'}>
                            <div className={'text---'}>
                                정산 내역 보기
                            </div>
                        </div>
                        <div className={'add-new-product-button'} onClick={showRegistrationForm}>
                            <div className={'text--'}>
                                신상품 등록하기
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <ProductRegistrationForm onBack={showDashboard} />
            )}
        </div>
    );
}