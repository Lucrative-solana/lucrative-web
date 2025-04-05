'use client'
import React, { JSX, useCallback, useEffect, useState } from 'react';
import './css/add-product.css'; // CSS 파일 경로
import { useWallet } from '@solana/wallet-adapter-react';
interface ProductRegistrationFormProps {
    onBack: () => void; // 대시보드로 돌아가기 함수
}

const ProductRegistrationForm: React.FC<ProductRegistrationFormProps> = ({ onBack }): JSX.Element => {
    // 폼 입력 값 상태 관리
    const { publicKey } = useWallet();
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number>(0); // 숫자 또는 빈 문자열
    const [quantity, setQuantity] = useState<number>(0);
    const [tokenDiscount, setTokenDiscount] = useState<number>(0);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false); // 드래그 상태 추가

    const sellerwallet = publicKey?.toString();
    // 폼 제출 처리 (실제 API 호출 로직 필요)
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('Form Submitted:', {
            productName,
            description,
            sellerwallet,
            price,
            quantity,
            tokenDiscount,
            imageFile,
        });
        // 여기서 API 호출 로직 구현
        // 셀러 등록 
        await fetch('/api/generate/seller-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                walletAddress: sellerwallet,
            }),
        }).then((response) => {
            console.log('Response:', response);
            if (response.status === 201) {
                alert('셀러 등록이 완료되었습니다.');
            } else {
                alert('셀러 등록에 실패했습니다.');
            }
        }).catch((error) => {
            console.error('Error:', error);
            alert('셀러 등록 중 오류가 발생했습니다.');
        });


        await fetch('/api/register/seller/item',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: productName,
                    description: description,
                    price: parseFloat(price),
                    walletAddress: sellerwallet,
                    discountRate: parseFloat(tokenDiscount),
                    quantity: parseFloat(quantity),
                }),
            }
        ).then((response) => {
            console.log('Response:', response);
            if (response.status === 201) {
                alert('상품 등록이 완료되었습니다.');
            } else {
                alert('상품 등록에 실패했습니다.');
            }
        }
        ).catch((error) => {
            console.error('Error:', error);
            alert('상품 등록 중 오류가 발생했습니다.');
        }
        );
        onBack(); // 등록 후 대시보드로 돌아가기
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

    // 이미지 변경 및 미리보기 처리 함수 (파일 객체를 인수로 받도록 수정)
    const processImageFile = useCallback((file: Blob | ((prevState: File | null) => File | null) | null) => {
        if (file instanceof Blob && file.type.startsWith('image/')) {
            if (file instanceof File) {
                setImageFile(file); // 파일 객체 저장
            } else {
                alert("이미지 파일만 업로드 가능합니다.");
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(typeof reader.result === 'string' ? reader.result : null); // 미리보기 URL 설정
            };
            reader.readAsDataURL(file);
        } else {
            alert("이미지 파일만 업로드 가능합니다.");
            // 필요시 기존 이미지/미리보기 초기화
            // setImageFile(null);
            // setImagePreview(null);
        }
    }, []); // 종속성 배열 비워둠 (컴포넌트 마운트 시 한 번만 생성)

    // 파일 입력(클릭) 시 처리 함수
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            processImageFile(file);
        }
    };

    const handlePaste = useCallback((event: React.ClipboardEvent<HTMLLabelElement>) => {
        const items = event.clipboardData?.items;
        if (!items) return; // 클립보드 데이터 없으면 종료

        let imageFile: File | null = null;

        // 클립보드 아이템 순회
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // 아이템 종류가 'file'이고 타입이 'image/'로 시작하는지 확인
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                imageFile = item.getAsFile(); // File 객체로 변환
                break; // 첫 번째 이미지만 처리
            }
        }

        // 이미지 파일이 클립보드에 있었다면
        if (imageFile) {
            event.preventDefault(); // 브라우저 기본 붙여넣기 동작 방지
            processImageFile(imageFile); // 이미지 처리 함수 호출
        }
        // 이미지 파일이 아니면 기본 동작 허용 (예: 텍스트 붙여넣기)

    }, [processImageFile]); // processImageFile 함수에 의존

    // --- 드래그 앤 드롭 핸들러 ---
    const handleDragEnter = useCallback((e: { preventDefault: () => void; stopPropagation: () => void; }) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    }, []);

    const handleDragLeave = useCallback((e: { preventDefault: () => void; stopPropagation: () => void; }) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    }, []);

    const handleDragOver = useCallback((e: { preventDefault: () => void; stopPropagation: () => void; }) => {
        e.preventDefault(); // 필수: onDrop 이벤트가 발생하도록 기본 동작 방지
        e.stopPropagation();
        // 필요하다면 여기에 추가 로직 (예: isDraggingOver 상태 강제 설정)
        if (!isDraggingOver) setIsDraggingOver(true); // 혹시 leave 이벤트가 제대로 처리 안됐을 경우 대비
    }, [isDraggingOver]); // isDraggingOver 상태 변화 시 함수 재생성 (최적화 고려)

    const handleDrop = useCallback((e: { preventDefault: () => void; stopPropagation: () => void; dataTransfer: { files: FileList; }; }) => {
        e.preventDefault(); // 필수: 브라우저가 파일을 여는 기본 동작 방지
        e.stopPropagation();
        setIsDraggingOver(false); // 드롭 완료 시 드래그 상태 해제

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0]; // 첫 번째 파일만 처리
            processImageFile(file); // 드롭된 파일 처리 함수 호출
        }
    }, [processImageFile]); // processImageFile 함수가 변경될 때만 재생성

    useEffect(() => {
        // 컴포넌트 언마운트 시 미리보기 URL 정리 (메모리 누수 방지)
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);


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
                            <label htmlFor="productImageInput" className="product-form__label">상품 이미지*</label>
                            <div className="product-form__image-upload">
                                {/* 실제 파일 input: 시각적으로 숨기고 label로 제어 */}
                                <input
                                    type="file"
                                    id="productImageInput" // ID 변경 (label의 htmlFor와 일치)
                                    name="productImage"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="product-form__image-input" // CSS에서 숨김 처리
                                    required={!imagePreview && !imageFile} // 이미지 없으면 필수
                                    style={{ display: 'none' }} // 직접 숨김 (CSS로도 가능)
                                />
                                {/* 드롭 영역 + 클릭 영역 (label 활용) */}
                                <label
                                    htmlFor="productImageInput" // input의 ID와 일치
                                    className={`product-form__image-dropzone ${isDraggingOver ? 'product-form__image-dropzone--dragging' : ''}`}
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onPaste={handlePaste}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="미리보기" className="product-form__image-preview" />
                                    ) : (
                                        <>
                                            <svg className="product-form__upload-icon" viewBox="0 0 24 24" fill="currentColor" width="48" height="48" style={{ marginBottom: '1rem', color: '#6c757d' }}>
                                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" /> {/* 구글 머티리얼 업로드 아이콘 예시 */}
                                            </svg>
                                            <p className="product-form__upload-text">이미지를 드래그하거나 클릭하여 업로드</p>
                                        </>
                                    )}
                                </label>
                            </div>
                            {/* 파일 이름 표시 등 추가 정보 영역 (선택 사항) */}
                            {imageFile && <p className="product-form__file-name">선택된 파일: {imageFile.name}</p>}
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
                                    onChange={(e) => setPrice(Number(e.target.value))}
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
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* 토큰 설정 섹션 */}
                <section className="product-form__section">
                    <h3 className="product-form__section-title">토큰 할인 설정</h3>
                    <div className="product-form__grid">
                        {/* Add-on 할인 */}
                        <div className="product-form__group">
                            <label htmlFor="tokenDiscount" className="product-form__label">Add-on 할인률 설정</label>
                            <div className="product-form__input-group">
                                <input
                                    type="number"
                                    id="tokenDiscount"
                                    name="tokenDiscount"
                                    className="product-form__input"
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    value={tokenDiscount}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (value > 100) {
                                            setTokenDiscount(100);
                                        } else if (value < 0) {
                                            setTokenDiscount(0);
                                        } else {
                                            setTokenDiscount(Number(e.target.value));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* 예상 수익 시뮬레이션 */}
                        {/* <div className="product-form__group product-form__simulation">
                            <h4 className="product-form__simulation-title">예상 수익 시뮬레이션</h4>
                            <p className="product-form__simulation-text">
                                1회 판매 시 예상 수익: <span className="product-form__profit">{calculateExpectedProfit()}</span>
                            </p>
                            <p className="product-form__simulation-text">
                                토큰 사용 시 예상 수익: <span className="product-form__profit">{calculateDiscountedProfit()}</span>
                            </p>
                        </div> */}
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