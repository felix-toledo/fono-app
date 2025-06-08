import React from 'react';

export const Loader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="relative w-16 h-16">
                <div className="absolute w-full h-full border-4 border-blue-100 rounded-full"></div>
                <div className="absolute w-full h-full border-4 border-blue-400 rounded-full animate-spin border-t-transparent"></div>
                <div className="absolute w-full h-full border-4 border-blue-300 rounded-full animate-spin border-b-transparent" style={{ animationDelay: '-0.5s' }}></div>
                <div className="absolute w-full h-full border-4 border-blue-200 rounded-full animate-spin border-l-transparent" style={{ animationDelay: '-1s' }}></div>
            </div>
        </div>
    );
}; 