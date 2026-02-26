import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import TrendingSidebar from "./TrendingSidebar";

export default function Layout({ children }) {
    const location = useLocation();
    const isChatPage = location.pathname.startsWith("/chat/");
    const hideSidebar = isChatPage || location.pathname === '/login' || location.pathname === '/register';

    return (
        <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 pt-16 transition-colors duration-200 ${isChatPage ? '' : 'pb-16 md:pb-0'}`}>
            <div className={`mx-auto ${isChatPage ? 'max-w-5xl h-[calc(100vh-64px)]' : 'max-w-5xl p-4'}`}>

                <div className={`grid grid-cols-1 ${!hideSidebar ? 'lg:grid-cols-4' : ''} gap-6`}>

                    {/* Main Content */}
                    <div className={`${!hideSidebar ? 'lg:col-span-3' : 'w-full'} ${isChatPage ? 'h-full' : ''}`}>
                        {children}
                    </div>

                    {/* Sidebar */}
                    {!hideSidebar && (
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-20">
                                <TrendingSidebar />
                            </div>
                        </div>
                    )}
                </div>

            </div>
            {!isChatPage && <BottomNav />}
        </div>
    );
}
