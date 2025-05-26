"use client";

import { Sidebar } from '@/components/Sidebar';

export default function FonoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 flex justify-center overflow-y-auto">
                <div className="w-full max-w-6xl p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
