import { Card } from './Card';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface QuickActionProps {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
    iconColor?: string;
    iconBgColor?: string;
}

export function QuickAction({ icon: Icon, title, description, href, iconColor = 'text-primary', iconBgColor = 'bg-primary/10' }: QuickActionProps) {
    return (
        <Link href={href}>
            <Card className="flex items-center p-5 hover:bg-gray-50 transition-colors cursor-pointer h-full">
                <Icon className={`h-10 w-10 ${iconColor} p-2 ${iconBgColor} rounded-lg`} />
                <div className="ml-4">
                    <h3 className="font-medium text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </Card>
        </Link>
    );
} 