'use client'
import Admin_Main from "../components/admin/main";
import SidePanel from "../components/admin/side-panel";
import './admin_box.css'
import { useState } from "react";

export default function Admin() {
    const [content, setContent] = useState(0);

    return (
        <>
            <div className="admin-main-box">
                <SidePanel setContent={setContent} />
                <Admin_Main setContent={setContent} content={content}/>
            </div>
        </>
    )
}