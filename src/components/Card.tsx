import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> { }

export const Card = ({ className = '', children, ...props }: CardProps) => {
    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}; 