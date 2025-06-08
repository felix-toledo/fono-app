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
            <div className="flex w-full min-h-screen">
                <Sidebar />
                <main className="flex-1 flex flex-col overflow-y-auto lg:ml-60 p-4">
                    <div className="max-w-7xl mx-auto w-full">
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
