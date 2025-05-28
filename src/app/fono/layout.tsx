"use client";

import { Sidebar } from '@/components/Sidebar';
import { ToastContainer } from 'react-toastify';
import { FonoProvider } from '@/contexts/FonoContext';
import 'react-toastify/dist/ReactToastify.css';

export default function FonoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <FonoProvider>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 flex flex-col overflow-y-auto lg:ml-0">
                    <div className="w-full max-w-6xl p-6 mx-auto">
                        {children}
                    </div>
                </main>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </FonoProvider>
    );
}
