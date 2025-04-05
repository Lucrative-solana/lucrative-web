'use client'
import './css/settings_content.css'
import DashBoard from './settings-content/dashboard';
import Admin_DevPage from './settings-content/devpage';

interface AdminContentProps {
    content: number;
}

export default function Settings_Content({ content }: AdminContentProps) {
    let contentToRender;

    switch (content) {
        case 0:
            contentToRender = <DashBoard />;
            break;
        case 1:
            contentToRender = <h1>Product Management</h1>;
            break;
        case 2:
            contentToRender = <h1>Order Management</h1>;
            break;
        case 3:
            contentToRender = <h1>Token Analyze</h1>;
            break;
        default:
            contentToRender = <h1>Dashboard Cotent</h1>;
            break;
    }
        
    return (
        <>
            <div className="admin-content">
                <div className="content-1">
                    {contentToRender}
                </div>
            </div>
        </>
    )
}