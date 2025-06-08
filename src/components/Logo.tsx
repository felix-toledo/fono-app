import Image from 'next/image';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = '', size = 'md' }: LogoProps) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            <Image
                src="/logo.png"
                alt="Fono App Logo"
                fill
                className="object-contain"
                priority
            />
        </div>
    );
}; 