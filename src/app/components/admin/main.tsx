'use client'
import Admin_Content from './admin-content'
import Admin_Header from './admin-header'
import './css/admin_main.css'

interface AdminMainProps {
    setContent: (content: number) => void;
    content: number;
}

export default function Admin_Main({ content }: AdminMainProps) {
    return (
        <>
            <div className='admin-content-box'>
                <Admin_Header content={content} />
                <Admin_Content content={content} />
            </div>
        </>
    )
}