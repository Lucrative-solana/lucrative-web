'use client'
import React, { useEffect, useState } from 'react';
import './css/content.css'

interface Product {
    id: number;
    imageUrl: string;
    name: string;
    originalPrice?: number; // 할인 전 가격 (옵션)
    price: number;
    discountAvailable?: boolean; // 할인 가능 여부 (필터링용)
}

// 샘플 상품 데이터 (실제로는 API 호출)
const sampleProducts: Product[] = [
    { id: 1, imageUrl: 'https://image-resource.creatie.ai/136506619952588/136506619952590/3ebd3348d07dd290cce3d744ed44f0eb.png', name: '프리미엄 간장게장', originalPrice: 50000, price: 40000, discountAvailable: true },
    { id: 2, imageUrl: 'https://image-resource.creatie.ai/136506619952588/136506619952590/41ad3e54cf83271e9c39d88d541e0cd6.png', name: '특선 갈비찜', originalPrice: 45000, price: 36000, discountAvailable: true },
    { id: 3, imageUrl: 'https://image-resource.creatie.ai/136506619952588/136506619952590/f0d696483fd317586046bc0781520136.png', name: '모둠회', originalPrice: 60000, price: 48000, discountAvailable: true },
    { id: 4, imageUrl: 'https://via.placeholder.com/400x300/cccccc/969696?text=Sample+Product+4', name: '신선 야채 세트', price: 25000, discountAvailable: false },
    { id: 5, imageUrl: 'https://via.placeholder.com/400x300/cccccc/969696?text=Sample+Product+5', name: '유기농 과일 믹스', price: 30000, discountAvailable: true },
    { id: 6, imageUrl: 'https://via.placeholder.com/400x300/cccccc/969696?text=Sample+Product+6', name: '수제 베이커리 세트', originalPrice: 35000, price: 31500, discountAvailable: true },
];

export default function Main_Content() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    // 필터링/정렬 상태 추가 가능
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [showDiscountOnly, setShowDiscountOnly] = useState(false);

    useEffect(() => {
        // 데이터 로딩 시뮬레이션
        setLoading(true);
        setTimeout(() => {
            // TODO: 실제 API 호출 및 필터/정렬 로직 적용
            setProducts(sampleProducts);
            setLoading(false);
        }, 500); // 0.5초 딜레이
    }, [category, sortBy, showDiscountOnly]); // 필터/정렬 상태 변경 시 재로딩

    return (
        <div className="landing-content-wrapper">

            <main className="landing-content">

                {/* --- Hero/Carousel 섹션 (Figma의 div-15) --- */}
                <section className="landing-content__hero-section">
                    {/* 캐러셀 구현 (라이브러리 사용 또는 CSS로 간단히) */}
                    {/* 예시: 단일 배너 */}
                    <div className="landing-content__hero-banner">
                        <img src="https://image-resource.creatie.ai/136506619952588/136506619952590/15c031754355eeb1d2d3a3d8b3ab78e0.png" alt="프리미엄 간장게장 할인" className="hero-banner__image" />
                        <div className="hero-banner__overlay">
                            <div className="hero-banner__content">
                                <p className="hero-banner__tag">🔥 Add-on 할인 중!</p>
                                <h2 className="hero-banner__title">프리미엄 간장게장</h2>
                                <p className="hero-banner__description">지금 구매시 20% 할인</p>
                                <button className="btn btn-outline">구매하기</button>
                            </div>
                        </div>
                    </div>
                    {/* 캐러셀 네비게이션 버튼 (Figma의 div-26) */}
                    {/* <div className="landing-content__hero-nav">
                    <button className="hero-nav-button active"></button>
                    <button className="hero-nav-button"></button>
                    <button className="hero-nav-button"></button>
                </div> */}
                </section>

                {/* --- 필터 섹션 (Figma의 div-5) --- */}
                <section className="landing-content__filters">
                    <div className="filters__group filters__group--category">
                        <label htmlFor="category-select" className="sr-only">카테고리</label> {/* 스크린리더 용 */}
                        <select
                            id="category-select"
                            className="filters__select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="all">전체 카테고리</option>
                            <option value="food">음식</option>
                            <option value="art">아트</option>
                            {/* ... 다른 카테고리 ... */}
                        </select>
                    </div>
                    <div className="filters__group filters__group--sort">
                        {/* 실제로는 button 그룹으로 만들고 활성 상태 관리 */}
                        <button
                            className={`filters__button ${sortBy === 'popular' ? 'active' : ''}`}
                            onClick={() => setSortBy('popular')}
                        >
                            {/* SVG 아이콘 추가 */} 인기
                        </button>
                        <button
                            className={`filters__button ${sortBy === 'newest' ? 'active' : ''}`}
                            onClick={() => setSortBy('newest')}
                        >
                            {/* SVG 아이콘 추가 */} 신상품
                        </button>
                        <button
                            className={`filters__button ${showDiscountOnly ? 'active' : ''}`}
                            onClick={() => setShowDiscountOnly(!showDiscountOnly)}
                        >
                            {/* SVG 아이콘 추가 */} 할인 가능
                        </button>
                    </div>
                </section>

                {/* --- 상품 그리드 섹션 (Figma의 div-6) --- */}
                <section className="landing-content__product-grid">
                    {loading ? (
                        <p>상품을 불러오는 중...</p>
                    ) : products.length > 0 ? (
                        products.map((product) => (
                            // 상품 카드 컴포넌트 분리 추천
                            <article className="product-card" key={product.id}>
                                <div className="product-card__image-wrapper">
                                    <img src={product.imageUrl} alt={product.name} className="product-card__image" />
                                    {product.discountAvailable && <span className="product-card__discount-badge">할인 가능</span>}
                                </div>
                                <div className="product-card__info">
                                    <h3 className="product-card__name">{product.name}</h3>
                                    <div className="product-card__price">
                                        {product.originalPrice && (
                                            <span className="product-card__price--original">
                                                ₩{product.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                        <span className="product-card__price--final">
                                            ₩{product.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <p>표시할 상품이 없습니다.</p>
                    )}
                </section>

                {/* --- Add-on 프로토콜 배너 섹션 (Figma의 div-13) --- */}
                <section className="landing-content__addon-banner">
                    <div className="addon-banner__content">
                        <h2 className="addon-banner__title">💡 Add-on Protocol 이란?</h2>
                        <p className="addon-banner__description">
                            토큰을 활용해 상품을 더 싸게 사는 Web3 커머스 플랫폼! 지갑만 연결하면 누구나 할인 가능!
                        </p>
                        <button className="btn btn-dark">
                            더 알아보기 {/* SVG 아이콘 추가 */}
                        </button>
                    </div>
                </section>
            </main>
        </div>
    )
};