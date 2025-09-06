import { Outlet } from "react-router-dom";
import React from "react";
import Footer from "./Footer";

export default function ChatLayout() {
    return (
        <div  className="chat-layout" style={{display:"flex",flexDirection:"column",height:"100vh"}}>
            <Outlet />
            <Footer />
           
        </div>
    );
}
