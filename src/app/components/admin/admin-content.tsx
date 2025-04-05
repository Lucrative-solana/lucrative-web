'use client'
import './css/admin_content.css'
import Admin_DevPage from './admin-content/devpage';

interface AdminContentProps {
    content: number;
}

export default function Admin_Content({ content }: AdminContentProps) {
    return (
        <>
            <div className="admin-content">
                <div className="content-1">
                    {content === 0 ? (
                        <h1>Admin Content</h1>
                    ) : (
                        <Admin_DevPage />
                    )}
                </div>
            </div>
        </>
    )
}