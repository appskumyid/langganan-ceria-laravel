
import React from 'react';
import * as LucideIcons from 'lucide-react';

// A type-safe way to get all Lucide icon components
const lucideIconsTyped = LucideIcons as { 
  [key: string]: React.FC<LucideIcons.LucideProps> 
};

export const iconMap: { [key: string]: React.ElementType } = {};

// Add all Lucide icons to the map dynamically
for (const key in lucideIconsTyped) {
  if (Object.prototype.hasOwnProperty.call(lucideIconsTyped, key)) {
    // Filter out non-component exports from lucide-react
    if (typeof lucideIconsTyped[key] === 'function' && /^[A-Z]/.test(key)) {
      iconMap[key] = lucideIconsTyped[key];
    }
  }
}

export const getIcon = (iconName: string | null | undefined): React.ElementType => {
    if (!iconName || !iconMap[iconName]) {
        return LucideIcons.HelpCircle; // Return a default icon
    }
    return iconMap[iconName];
};
