'use client';
import './css/product.css';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation'; // URL 파라미터 가져오기
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SendTransactionError, SystemProgram, Transaction } from "@solana/web3.js";


// 상품 데이터 타입 (API 응답 기반)
interface ProductData {
    id: string;
    name: string;
    description: string;
    price: number;
    walletAddress: string;
    discountRate?: number;
    quantity: number; // 재고 수량
    createdAt: string;
    updatedAt: string;
    // API 응답에 이미지 URL이 있다면 추가
    imageUrls?: string[]; // 메인 이미지 및 썸네일 URL 배열 (예시)
}

// 가격 포맷 함수
const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR');
};

// SOL 가격 포맷 함수 (소수점 6자리까지 표시)
const formatSol = (amount: number): string => {
    return amount.toFixed(6);
};

export default function ProductDetailPage() {
    const params = useParams(); // { id: 'd11eba8a-...' } 형태의 객체 반환
    const id = params?.id as string; // id 추출 (타입 단언)
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [widhrawAddress, setWithdrawAddress] = useState('');
    const [widhrawAmount, setWithdrawAmount] = useState(0);
    const [product, setProduct] = useState<ProductData | null>(null);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1); // 선택된 수량 상태
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0); // 메인 이미지 인덱스
    const [activeTab, setActiveTab] = useState<string>('description'); // 활성 탭 상태
    const [sellerwallet, setSellerWallet] = useState<string>(''); // 판매자 지갑 주소
    const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false); // 결제 진행 상태 추가


    // 데이터 가져오기 로직
    useEffect(() => {
        if (!id) return; // id가 없으면 실행하지 않음

        async function fetchProduct() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/search/item-by-id/${id}`); // API 엔드포인트 확인 필요
                if (!response.ok) {
                    throw new Error(`상품 정보를 불러오지 못했습니다: ${response.status}`);
                }
                const data: ProductData = await response.json();
                // API 응답에 imageUrls가 없다면 임시 데이터 추가 (실제로는 API 수정 필요)
                if (!data.imageUrls || data.imageUrls.length === 0) { }
                setSellerWallet(data.walletAddress);
                setProduct(data);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err instanceof Error ? err.message : "상품 정보를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id]); // id가 변경될 때마다 데이터를 다시 가져옴

    // 수량 변경 핸들러
    const handleQuantityChange = useCallback((amount: number) => {
        if (!product) return;
        setSelectedQuantity(prev => {
            const newValue = prev + amount;
            if (newValue < 1) return 1; // 최소 수량 1
            if (newValue > product.quantity) return product.quantity; // 최대 재고 수량
            return newValue;
        });
    }, [product]);

    // --- 계산 로직 ---
    const discountedPrice = product?.discountRate
        ? Math.round(product.price * (1 - product.discountRate / 100))
        : product?.price ?? 0;

    const totalPrice = discountedPrice * selectedQuantity;
    const totalOriginalPrice = (product?.price ?? 0) * selectedQuantity;
    const totalDiscountAmount = totalOriginalPrice - totalPrice;

    // --- 로딩 및 에러 처리 ---
    if (loading) {
        return <div className="product-detail-container loading">상품 정보를 불러오는 중...</div>;
    }
    if (error) {
        return <div className="product-detail-container error">오류: {error}</div>;
    }
    if (!product) {
        return <div className="product-detail-container">상품 정보를 찾을 수 없습니다.</div>;
    }

    const fetchSolPriceInKRW = async (): Promise<number | null> => {
        try {
            // CoinGecko API 사용 (무료 버전은 호출 제한이 있을 수 있음)
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=krw');
            if (!response.ok) {
                throw new Error(`CoinGecko API 오류: ${response.status}`);
            }
            const data = await response.json();
            if (data.solana && data.solana.krw) {
                console.log(`현재 SOL/KRW 시세: ${data.solana.krw}`);
                return data.solana.krw;
            } else {
                throw new Error('SOL/KRW 시세 정보를 가져올 수 없습니다.');
            }
        } catch (err) {
            console.error("SOL 시세 조회 오류:", err);
            setError(err instanceof Error ? `시세 조회 실패: ${err.message}` : "SOL 시세를 가져오는 중 오류가 발생했습니다.");
            return null;
        }
    };


    // 결제 로직
    const onSubmit = async () => {
        if (!product || !publicKey || !sellerwallet) {
            alert('결제에 필요한 정보가 부족합니다. (상품 정보, 지갑 연결, 판매자 주소)');
            return;
        }
        if (isProcessingPayment) return; // 중복 클릭 방지

        setIsProcessingPayment(true); // 결제 시작 표시
        setError(null); // 이전 오류 메시지 초기화

        try {
            // 1. SOL 시세 조회
            alert('SOL/KRW 현재 시세를 조회합니다...');
            const solPriceKRW = await fetchSolPriceInKRW();

            if (!solPriceKRW) {
                alert('SOL 시세를 조회하지 못해 결제를 진행할 수 없습니다.');
                setIsProcessingPayment(false);
                return;
            }

            // 2. KRW -> SOL 변환
            const amountInSol = totalPrice / solPriceKRW;
            const amountInLamports = Math.floor(amountInSol * LAMPORTS_PER_SOL); // Lamport는 정수여야 함

            if (amountInLamports <= 0) {
                 alert('결제 금액이 너무 작습니다.');
                 setIsProcessingPayment(false);
                 return;
            }

            // 3. 사용자 확인
            const confirmWithdraw = window.confirm(
                '구매를 진행하시겠습니까?\n\n' +
                `상품명: ${product.name}\n` +
                `수량: ${selectedQuantity}개\n` +
                `결제 금액 (KRW): ₩${formatPrice(totalPrice)}\n` +
                `결제 금액 (SOL): ${formatSol(amountInSol)} SOL\n` + // 변환된 SOL 표시
                `판매자 주소: ${sellerwallet}\n\n` +
                '솔라나 네트워크 트랜잭션을 진행합니다.\n' +
                '진행하시려면 "확인"을, 취소하시려면 "취소"를 눌러주세요.'
            );

            if (!confirmWithdraw) {
                alert('결제가 취소되었습니다.');
                setIsProcessingPayment(false);
                return;
            }

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


            // 4. Solana 트랜잭션 실행
            alert('Solana 지갑으로 트랜잭션을 전송합니다...');
            const signature = await buysendwidhraw();

            // 5. 트랜잭션 성공 후 백엔드 API 호출
            alert(`송금이 완료되었습니다! 트랜잭션 ID: ${signature}\n서버에 거래 내역을 기록합니다.`);

            // 백엔드에 기록 (실패해도 일단 SOL 전송은 성공한 상태)
            try {
                const backendResponse = await fetch('/api/dev/widhdraw', { // 'withdraw'로 오타 수정 권장
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        buyer: publicKey.toString(),
                        seller: sellerwallet, // 실제 판매자 주소
                        itemId: product.id,
                        itemName: product.name,
                        itemDescription: product.description,
                        quantity: selectedQuantity,
                    }),
                });

                if (!backendResponse.ok) {
                    // 백엔드 기록 실패 시 사용자에게 알림 (하지만 SOL은 이미 전송됨)
                    const errorData = await backendResponse.text();
                    console.error('백엔드 기록 실패:', backendResponse.status, errorData);
                    alert(`SOL 송금은 성공했으나 서버에 거래 내역 기록 중 오류가 발생했습니다. 관리자에게 문의하세요. (Tx: ${signature})`);
                } else {
                    console.log('백엔드 기록 성공:', await backendResponse.json());
                    alert('구매 내역이 성공적으로 기록되었습니다.');
                    // 구매 성공 후 처리 (예: 장바구니 비우기, 감사 페이지 이동 등)
                }
            } catch (backendError) {
                 console.error("백엔드 API 호출 오류:", backendError);
                 alert(`SOL 송금은 성공했으나 서버에 거래 내역 기록 중 네트워크 오류가 발생했습니다. 관리자에게 문의하세요. (Tx: ${signature})`);
            }

        } catch (err) {
            console.error("결제 프로세스 오류:", err);
            // sendSolTransaction에서 던진 오류 처리 포함
            if (err instanceof SendTransactionError) {
                 alert(`Solana 트랜잭션 전송 실패: ${err.message}`);
            } else if (err instanceof Error) {
                 alert(`결제 중 오류 발생: ${err.message}`);
            } else {
                 alert('알 수 없는 오류로 결제에 실패했습니다.');
            }
        } finally {
            setIsProcessingPayment(false); // 결제 종료 표시
        }
    }



    // --- 메인 렌더링 ---
    return (
        <div className="product-page-wrapper">

            <div className="product-detail-container">
                {/* 상단 상품 정보 (이미지 + 구매 정보) */}
                <div className="product-main-section">
                    {/* 좌측: 이미지 갤러리 */}
                    <div className="product-image-section">
                        <div className="product-image__main">
                            <img src={product.imageUrls?.[activeImageIndex] || '/placeholder-image.svg'} alt={product.name} />
                        </div>
                    </div>

                    {/* 우측: 상품 상세 및 구매 */}
                    <div className="product-purchase-section">
                        <h1>{product.name}</h1>

                        {/* 가격 정보 */}
                        <div className="product-pricing">
                            {product.discountRate && product.discountRate > 0 && (
                                <p className="original-price">정가: ₩{formatPrice(product.price)}</p>
                            )}
                            <p className="discounted-price">
                                {product.discountRate && product.discountRate > 0 ? 'Add-on 할인가: ' : '판매가: '}
                                ₩{formatPrice(discountedPrice)}
                            </p>
                            {/* 토큰 할인 정보 뱃지 (디자인 참고) */}
                            {product.discountRate && product.discountRate > 0 && (
                                <div className="discount-badge">
                                    {/* SVG 아이콘 필요 */}
                                    <span>토큰 {/**/}개로 {product.discountRate}% 할인 적용됨</span>
                                </div>
                            )}
                        </div>

                        {/* 수량 선택 */}
                        <div className="product-quantity">
                            <label htmlFor="quantity">수량</label>
                            <div className="quantity-control">
                                <button onClick={() => handleQuantityChange(-1)} disabled={selectedQuantity <= 1}>-</button>
                                <input type="number" id="quantity" value={selectedQuantity} readOnly />
                                <button onClick={() => handleQuantityChange(1)} disabled={selectedQuantity >= product.quantity}>+</button>
                            </div>
                            <span className="stock-info">(재고: {product.quantity}개)</span>
                        </div>

                        {/* 결제 정보 요약 */}
                        <div className="payment-summary">
                            <h3>결제 정보</h3>
                            <div className="summary-row">
                                <span>상품 금액 ({selectedQuantity}개)</span>
                                <span>₩{formatPrice(totalOriginalPrice)}</span>
                            </div>
                            {totalDiscountAmount > 0 && (
                                <div className="summary-row discount">
                                    <span>Add-on 할인 (-{product.discountRate}%)</span>
                                    <span>-₩{formatPrice(totalDiscountAmount)}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>최종 결제 금액</span>
                                <span>₩{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        {/* 구매 버튼 */}
                        <div className="product-actions">
                            <button className="buy-button" onClick={onSubmit}>
                                {/* SVG 아이콘 필요 */}
                                Add-on으로 결제하기
                            </button>
                            <div className="secure-message">
                                {/* SVG 아이콘 필요 */}
                                <span>트랜잭션은 안전하게 암호화되어 처리됩니다</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 추가 정보 (탭) */}
                <div className="product-info-section">
                    <div className="product-tabs">
                        <button
                            className={activeTab === 'description' ? 'active' : ''}
                            onClick={() => setActiveTab('description')}
                        >
                            상품 설명
                        </button>
                        <button
                            className={activeTab === 'reviews' ? 'active' : ''}
                            onClick={() => setActiveTab('reviews')}
                        >
                            리뷰
                        </button>
                        <button
                            className={activeTab === 'shipping' ? 'active' : ''}
                            onClick={() => setActiveTab('shipping')}
                        >
                            배송 안내
                        </button>
                    </div>
                    <div className="product-tab-content">
                        {activeTab === 'description' && (
                            <div className="description-content">
                                <h2>상품 소개</h2>
                                <p>{product.description}</p>
                                {/* Add-on 혜택 등 추가 정보 */}
                                <div className='addon-benefits'>
                                    <h3>Add-on Protocol 혜택</h3>
                                    <ul>
                                        <li> {/* SVG */} 토큰 {/**/}개 사용 시 {product.discountRate}% 할인</li>
                                        <li> {/* SVG */} 구매 시 토큰 {/**/}개 적립</li>
                                        <li> {/* SVG */} 토큰 보유자 전용 프로모션 참여 가능</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div>
                                <h2>리뷰</h2>
                                <p>리뷰 내용이 여기에 표시됩니다. (추후 구현)</p>
                            </div>
                        )}
                        {activeTab === 'shipping' && (
                            <div>
                                <h2>배송 안내</h2>
                                <p>배송 관련 안내 내용이 여기에 표시됩니다. (추후 구현)</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}