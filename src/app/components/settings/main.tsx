import './css/settings_main.css'
import Settings_Header from './settings-header';
import Settings_Content from './settings-content';

interface AdminMainProps {
    setContent: (content: number) => void;
    content: number;
}

export default function Settings_Main({ content }: AdminMainProps) {
    return (
        <>
            <div className='admin-content-box'>
                <Settings_Header content={content} />
                <Settings_Content content={content} />
            </div>
        </>
    )
}