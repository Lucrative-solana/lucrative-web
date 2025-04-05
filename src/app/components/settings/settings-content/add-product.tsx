'use client'
import React, { useState } from 'react';
import './css/add-product.css'; // CSS 파일 경로

interface ProductRegistrationFormProps {
    onBack: () => void; // 대시보드로 돌아가기 함수
}

const ProductRegistrationForm: React.FC<ProductRegistrationFormProps> = ({ onBack }) => {
    // 폼 입력 값 상태 관리
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | string>(''); // 숫자 또는 빈 문자열
    const [quantity, setQuantity] = useState<number | string>('');
    const [tokenDiscount, setTokenDiscount] = useState<number | string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // 이미지 업로드 처리
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    // 폼 제출 처리 (실제 API 호출 로직 필요)
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('Form Submitted:', {
            productName,
            description,
            price,
            quantity,
            tokenDiscount,
            imageFile,
        });
        // 여기서 API 호출 로직 구현
        // 예: await registerProduct({ productName, ... });
        alert('상품이 등록되었습니다! (실제 구현 필요)');
        // onBack(); // 등록 후 대시보드로 돌아가기
    };

    // 임시 저장 처리 (실제 로직 필요)
    const handleSaveDraft = () => {
         console.log('Save Draft Clicked:', { /* ...form data... */ });
         alert('임시 저장되었습니다! (실제 구현 필요)');
     };

    // 예상 수익 계산 (예시)
    const calculateExpectedProfit = () => {
        const numericPrice = Number(price);
        return isNaN(numericPrice) ? '₩0' : `₩${numericPrice.toLocaleString()}`;
    };

    const calculateDiscountedProfit = () => {
        const numericPrice = Number(price);
        const numericDiscount = Number(tokenDiscount); // GZ 토큰 가치 변환 필요
        // 실제 로직: 토큰 가치 * 할인율 등 계산
        const discountAmount = isNaN(numericDiscount) ? 0 : numericDiscount * 100; // 임시 계산
        const discountedPrice = isNaN(numericPrice) ? 0 : numericPrice - discountAmount;
        return `₩${discountedPrice < 0 ? 0 : discountedPrice.toLocaleString()}`;
    };


    return (
        // product-form 블록
        <div className="product-form-container"> {/* 전체 페이지 컨테이너 */}
             <button onClick={onBack} className="product-form__back-button">← 뒤로가기</button>
             <h2 className="product-form__main-title">상품 등록</h2>

            <form className="product-form" onSubmit={handleSubmit}>
                 {/* 기본 정보 섹션 */}
                <section className="product-form__section">
                    <h3 className="product-form__section-title">기본 정보</h3>
                    <div className="product-form__grid"> {/* 내부 필드 정렬을 위한 그리드 */}
                         {/* 상품명 */}
                         <div className="product-form__group">
                             <label htmlFor="productName" className="product-form__label">상품명*</label>
                             <input
                                 type="text"
                                 id="productName"
                                 name="productName"
                                 className="product-form__input"
                                 placeholder="상품명을 입력하세요"
                                 value={productName}
                                 onChange={(e) => setProductName(e.target.value)}
                                 required
                             />
                         </div>

                         {/* 상품 설명 */}
                         <div className="product-form__group product-form__group--full-width"> {/* 설명은 넓게 */}
                             <label htmlFor="description" className="product-form__label">상품 설명*</label>
                             <textarea
                                 id="description"
                                 name="description"
                                 className="product-form__textarea"
                                 placeholder="상품에 대한 상세 설명을 입력하세요"
                                 rows={5} // 여러 줄 입력 가능
                                 value={description}
                                 onChange={(e) => setDescription(e.target.value)}
                                 required
                             />
                         </div>

                         {/* 상품 이미지 */}
                         <div className="product-form__group product-form__group--full-width">
                            <label htmlFor="productImage" className="product-form__label">상품 이미지*</label>
                            <div className="product-form__image-upload">
                                <input
                                    type="file"
                                    id="productImage"
                                    name="productImage"
                                    accept="image/*" // 이미지 파일만 허용
                                    onChange={handleImageChange}
                                    className="product-form__image-input" // 실제 input은 숨김 처리 가능
                                    required={!imagePreview} // 이미지가 없을 때만 필수
                                />
                                <label htmlFor="productImage" className="product-form__image-dropzone">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="미리보기" className="product-form__image-preview" />
                                    ) : (
                                        <>
                                            {/* SVG 아이콘은 직접 추가하거나 라이브러리 사용 */}
                                            <svg className="product-form__upload-icon" /* ... SVG 속성 ... */ viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></svg>
                                            <p className="product-form__upload-text">이미지를 드래그하거나 클릭하여 업로드</p>
                                        </>
                                    )}
                                 </label>
                             </div>
                         </div>
                    </div>
                 </section>

                 {/* 가격 설정 섹션 */}
                <section className="product-form__section">
                    <h3 className="product-form__section-title">가격 설정</h3>
                     <div className="product-form__grid">
                         {/* 판매가 */}
                         <div className="product-form__group">
                             <label htmlFor="price" className="product-form__label">판매가*</label>
                             <div className="product-form__input-group"> {/* Input과 단위를 묶음 */}
                                 <span className="product-form__input-addon">₩</span>
                                 <input
                                     type="number"
                                     id="price"
                                     name="price"
                                     className="product-form__input product-form__input--prepended"
                                     placeholder="0"
                                     min="0" // 최소값
                                     value={price}
                                     onChange={(e) => setPrice(e.target.value)}
                                     required
                                 />
                            </div>
                         </div>

                         {/* 수량 */}
                         <div className="product-form__group">
                             <label htmlFor="quantity" className="product-form__label">수량*</label>
                             <input
                                 type="number"
                                 id="quantity"
                                 name="quantity"
                                 className="product-form__input"
                                 placeholder="재고 수량 입력"
                                 min="0"
                                 value={quantity}
                                 onChange={(e) => setQuantity(e.target.value)}
                                 required
                             />
                        </div>
                     </div>
                </section>

                {/* 토큰 설정 섹션 */}
                <section className="product-form__section">
                    <h3 className="product-form__section-title">토큰 설정</h3>
                    <div className="product-form__grid">
                        {/* Add-on 할인 */}
                        <div className="product-form__group">
                            <label htmlFor="tokenDiscount" className="product-form__label">Add-on 할인 (GZ토큰)</label>
                            <div className="product-form__input-group">
                                <input
                                    type="number"
                                    id="tokenDiscount"
                                    name="tokenDiscount"
                                    className="product-form__input"
                                    placeholder="0"
                                    min="0"
                                    value={tokenDiscount}
                                    onChange={(e) => setTokenDiscount(e.target.value)}
                                />
                                <span className="product-form__input-addon product-form__input-addon--append">GZ토큰</span>
                            </div>
                        </div>

                        {/* 예상 수익 시뮬레이션 */}
                         <div className="product-form__group product-form__simulation">
                             <h4 className="product-form__simulation-title">예상 수익 시뮬레이션</h4>
                             <p className="product-form__simulation-text">
                                 1회 판매 시 예상 수익: <span className="product-form__profit">{calculateExpectedProfit()}</span>
                            </p>
                             <p className="product-form__simulation-text">
                                토큰 사용 시 예상 수익: <span className="product-form__profit">{calculateDiscountedProfit()}</span>
                            </p>
                        </div>
                    </div>
                 </section>

                {/* 제출 버튼 영역 */}
                <div className="product-form__actions">
                    <button type="button" className="btn btn-secondary" onClick={handleSaveDraft}>임시 저장</button>
                    <button type="submit" className="btn btn-primary">상품 등록하기</button>
                </div>
            </form>
        </div>
    );
};

export default ProductRegistrationForm;