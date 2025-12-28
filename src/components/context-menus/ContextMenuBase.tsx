// Base Context Menu Components
// Provides macOS-styled primitives for all context menus in zOS

import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { ChevronRight, Check } from 'lucide-react';
import type {
  ContextMenuEntry,
  ContextMenuItem as MenuItemType,
  ContextMenuSubmenu as SubmenuType,
  ContextMenuRadioGroup as RadioGroupType,
  isSeparator,
  isSubmenu,
  isRadioGroup,
  isLabel,
  isMenuItem,
} from '@/types/contextMenu';

// macOS-style context menu container
export const MacContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuContent>
>(({ className, children, ...props }, ref) => (
  <ContextMenuContent
    ref={ref}
    className={cn(
      // macOS styling
      'min-w-[220px] bg-black/80 backdrop-blur-xl',
      'border border-white/20 rounded-xl shadow-2xl',
      'text-white/90 text-[13px] py-1.5 font-medium',
      'z-[20000]',
      className
    )}
    {...props}
  >
    {children}
  </ContextMenuContent>
));
MacContextMenuContent.displayName = 'MacContextMenuContent';

// macOS-style menu item
interface MacMenuItemProps {
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  checked?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MacMenuItem: React.FC<MacMenuItemProps> = ({
  icon,
  label,
  shortcut,
  disabled = false,
  danger = false,
  checked,
  onClick,
  className,
}) => {
  if (checked !== undefined) {
    return (
      <ContextMenuCheckboxItem
        checked={checked}
        onCheckedChange={() => onClick?.()}
        disabled={disabled}
        className={cn(
          'mx-1.5 px-3 py-[6px] rounded-[5px] cursor-pointer',
          'transition-colors duration-75',
          'focus:bg-blue-500 focus:text-white',
          'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
          danger && 'text-red-400 focus:bg-red-500 focus:text-white',
          className
        )}
      >
        <span className="flex items-center gap-2.5">
          {icon && <span className="w-4 h-4 flex items-center justify-center opacity-70">{icon}</span>}
          <span>{label}</span>
        </span>
        {shortcut && <ContextMenuShortcut className="text-white/50 ml-6 text-xs">{shortcut}</ContextMenuShortcut>}
      </ContextMenuCheckboxItem>
    );
  }

  return (
    <ContextMenuItem
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'mx-1.5 px-3 py-[6px] rounded-[5px] cursor-pointer',
        'transition-colors duration-75',
        'focus:bg-blue-500 focus:text-white',
        'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
        danger && 'text-red-400 focus:bg-red-500 focus:text-white',
        className
      )}
    >
      <span className="flex items-center gap-2.5 flex-1">
        {icon && <span className="w-4 h-4 flex items-center justify-center opacity-70">{icon}</span>}
        <span>{label}</span>
      </span>
      {shortcut && <ContextMenuShortcut className="text-white/50 ml-6 text-xs">{shortcut}</ContextMenuShortcut>}
    </ContextMenuItem>
  );
};

// macOS-style separator
export const MacSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <ContextMenuSeparator className={cn('h-[1px] bg-white/10 my-[6px] mx-3', className)} />
);

// macOS-style section label
export const MacLabel: React.FC<{ label: string; className?: string }> = ({ label, className }) => (
  <ContextMenuLabel className={cn('px-4 py-1.5 text-white/40 text-xs uppercase tracking-wider', className)}>
    {label}
  </ContextMenuLabel>
);

// macOS-style submenu trigger
interface MacSubmenuProps {
  icon?: React.ReactNode;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const MacSubmenu: React.FC<MacSubmenuProps> = ({
  icon,
  label,
  disabled = false,
  children,
  className,
}) => (
  <ContextMenuSub>
    <ContextMenuSubTrigger
      disabled={disabled}
      className={cn(
        'mx-1.5 px-3 py-[6px] rounded-[5px] cursor-pointer',
        'transition-colors duration-75',
        'focus:bg-blue-500 focus:text-white',
        'data-[state=open]:bg-blue-500 data-[state=open]:text-white',
        'data-[disabled]:opacity-40 data-[disabled]:cursor-default',
        className
      )}
    >
      <span className="flex items-center gap-2.5 flex-1">
        {icon && <span className="w-4 h-4 flex items-center justify-center opacity-70">{icon}</span>}
        <span>{label}</span>
      </span>
      <ChevronRight className="w-3 h-3 opacity-50 ml-auto" />
    </ContextMenuSubTrigger>
    <ContextMenuSubContent className={cn(
      'min-w-[180px] bg-black/80 backdrop-blur-xl',
      'border border-white/20 rounded-xl shadow-2xl',
      'text-white/90 text-[13px] py-1.5 font-medium',
      'z-[20001]'
    )}>
      {children}
    </ContextMenuSubContent>
  </ContextMenuSub>
);

// macOS-style radio group
interface MacRadioGroupProps {
  value: string;
  onValueChange?: (value: string) => void;
  items: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export const MacRadioGroup: React.FC<MacRadioGroupProps> = ({
  value,
  onValueChange,
  items,
  className,
}) => (
  <ContextMenuRadioGroup value={value} onValueChange={onValueChange}>
    {items.map((item) => (
      <ContextMenuRadioItem
        key={item.value}
        value={item.value}
        className={cn(
          'mx-1.5 px-3 py-[6px] rounded-[5px] cursor-pointer',
          'transition-colors duration-75',
          'focus:bg-blue-500 focus:text-white',
          className
        )}
      >
        <span className="flex items-center gap-2.5">
          {item.icon && <span className="w-4 h-4 flex items-center justify-center opacity-70">{item.icon}</span>}
          <span>{item.label}</span>
        </span>
      </ContextMenuRadioItem>
    ))}
  </ContextMenuRadioGroup>
);

// Re-export primitives for convenience
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuShortcut,
};
