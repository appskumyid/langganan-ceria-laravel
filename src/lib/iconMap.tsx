
import React from 'react';
import { icons, HelpCircle } from 'lucide-react';

export const iconMap: { [key: string]: React.ElementType } = icons;

export const getIcon = (iconName: string | null | undefined): React.ElementType => {
    if (!iconName || !iconMap[iconName]) {
        return HelpCircle; // Return a default icon
    }
    return iconMap[iconName];
};
