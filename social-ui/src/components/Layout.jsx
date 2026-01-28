export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20">
            <div className="max-w-2xl mx-auto p-4">
                {children}
            </div>
        </div>
    );
}
