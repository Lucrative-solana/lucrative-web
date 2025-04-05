'use client'
import Settings_Main from "../components/settings/main";
import SidePanel from "../components/settings/side-panel";
import './settings_box.css'
import { useState } from "react";

export default function Admin() {
    const [content, setContent] = useState(0);

    return (
        <>
            <div className="settings-main-box">
                <SidePanel setContent={setContent} />
                <Settings_Main setContent={setContent} content={content}/>
            </div>
        </>
    )
}