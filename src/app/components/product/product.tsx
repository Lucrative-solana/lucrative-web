'use client';
import './css/product.css';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation'; // URL 파라미터 가져오기

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

export default function ProductDetailPage() {
    const params = useParams(); // { id: 'd11eba8a-...' } 형태의 객체 반환
    const id = params?.id as string; // id 추출 (타입 단언)

    const [product, setProduct] = useState<ProductData | null>(null);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1); // 선택된 수량 상태
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0); // 메인 이미지 인덱스
    const [activeTab, setActiveTab] = useState<string>('description'); // 활성 탭 상태

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
                            <button className="buy-button">
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