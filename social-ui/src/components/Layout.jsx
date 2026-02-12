import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function Layout({ children }) {
    const location = useLocation();
    const isChatPage = location.pathname.startsWith("/chat/");

    return (
        <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 ${isChatPage ? '' : 'pb-20 md:pb-0'}`}>
            <div className={`max-w-2xl mx-auto ${isChatPage ? 'h-[calc(100vh-80px)] p-0' : 'p-4'}`}>
                {children}
            </div>
            {!isChatPage && <BottomNav />}
        </div>
    );
}
