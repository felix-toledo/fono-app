import { Card } from './Card';

interface StatCardProps {
    title: string;
    value: number;
    subtitle?: string;
    className?: string;
}

export function StatCard({ title, value, subtitle, className = '' }: StatCardProps) {
    return (
        <Card className={`flex flex-col justify-center items-center p-6 text-center ${className}`}>
            <h2 className="text-lg font-medium text-gray-800">{title}</h2>
            <p className="text-3xl font-bold text-primary mt-2 mb-4">{value}</p>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </Card>
    );
} 