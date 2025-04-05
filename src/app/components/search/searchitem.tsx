'use client'
import Link from 'next/link';
import './css/searchitem.css'
import { useEffect, useState } from 'react';

interface Item {
    id: string;
    name: string;
    description: string; // 설명도 필요하면 카드에 추가 가능
    price: number;
    walletAddress: string; // 필요시 사용
    discountRate?: number; // 할인이 없을 수 있으므로 optional
    quantity: number; // 재고 필요시 사용
    // API 응답에 이미지 URL이 있다면 추가해야 합니다.
    imageUrl?: string; // 예시: 이미지 URL 필드
}

const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR'); // 한국 원화 형식으로 포맷
};

const ItemCard: React.FC<{ item: Item }> = ({ item }) => {
    const discountedPrice = item.discountRate
        ? Math.round(item.price * (1 - item.discountRate / 100))
        : item.price;

    // 임시 이미지 URL 또는 기본값 설정
    const displayImageUrl = item.imageUrl || '/placeholder-image.svg'; // public 폴더에 플레이스홀더 이미지 필요

    return (
        // Link 컴포넌트로 카드 전체를 감싸 클릭 시 페이지 이동
        <Link href={`/product/${item.id}`} className="item-card" legacyBehavior={false}>
             {/* 상품 이미지 */}
            <div className="item-card__image-container">
                <img
                    src={displayImageUrl}
                    alt={item.name}
                    className="item-card__image"
                    // onError={(e) => (e.currentTarget.src = '/placeholder-image.svg')} // 이미지 로드 실패 시 대체
                />
                 {/* 할인율 뱃지 (할인율이 있을 경우) */}
                {item.discountRate && item.discountRate > 0 && (
                    <div className="item-card__badge">{item.discountRate}% OFF</div>
                    // 디자인 이미지의 'Add-on 할인' 뱃지는 discountRate 외 다른 조건이 필요할 수 있음
                )}
            </div>
             {/* 상품 정보 */}
            <div className="item-card__content">
                <h3 className="item-card__name">{item.name}</h3>
                <div className="item-card__price-section">
                     {/* 할인율 표시 (텍스트 형태) - 디자인과 약간 다름 */}
                     {/* {item.discountRate && item.discountRate > 0 && (
                        <span className="item-card__discount-rate">{item.discountRate}%</span>
                     )} */}
                    <span className="item-card__discounted-price">
                        {formatPrice(discountedPrice)}원
                    </span>
                     {/* 원가 표시 (할인율이 있을 경우) */}
                    {item.discountRate && item.discountRate > 0 && (
                        <span className="item-card__original-price">
                            {formatPrice(item.price)}원
                        </span>
                    )}
                </div>
                 {/* 필요하다면 설명이나 재고 등 추가 */}
                 {/* <p className="item-card__description">{item.description}</p> */}
            </div>
        </Link>
    );
};


export default function Search_Item() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchItems() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/get-all-items'); // API 경로 확인 필요

                if (!response.ok) {
                    throw new Error(`API 요청 실패: ${response.status}`);
                }

                const data = await response.json();
                // API 응답 구조에 따라 data 접근 방식 수정 필요 (예: data.items 등)
                setItems(data || []); // API 응답이 배열이라고 가정, 아니면 data.items 등으로 수정

            } catch (err) {
                console.error("아이템 로딩 중 에러:", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("알 수 없는 오류가 발생했습니다.");
                }
                setItems([]); // 에러 발생 시 빈 배열로 설정
            } finally {
                setLoading(false); // 로딩 종료
            }
        }

        fetchItems();
    }, []); // 컴포넌트 마운트 시 1회 실행

    // 로딩 중 UI
    if (loading) {
        return <div className="search-item-box"><p className="loading-message">상품을 불러오는 중...</p></div>;
    }

    // 에러 발생 UI
    if (error) {
        return <div className="search-item-box"><p className="error-message">오류: {error}</p></div>;
    }

    // 메인 컨텐츠 렌더링
    return (
        <div>
            <div className='search-item-box'>
                {items.length === 0 && !loading && (
                    <p className="no-items-message">표시할 상품이 없습니다.</p>
                )}

                {items.length > 0 && (
                    <div className="item-grid">
                        {items.map((item: Item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}