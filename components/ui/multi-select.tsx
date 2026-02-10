'use client';

import * as React from 'react';
import { X, Check, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Select options...',
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((item) => item !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const handleRemove = (value: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter((item) => item !== value));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'w-full justify-between min-h-[42px] h-auto py-2 px-3',
                        'hover:bg-transparent focus:ring-2 focus:ring-[#C26E26] focus:ring-offset-0',
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1.5 flex-1">
                        {selected.length === 0 ? (
                            <span className="text-muted-foreground font-normal">{placeholder}</span>
                        ) : (
                            selected.map((value) => (
                                <Badge
                                    key={value}
                                    variant="secondary"
                                    className="bg-[#C26E26]/10 text-[#C26E26] hover:bg-[#C26E26]/20 px-2 py-0.5"
                                >
                                    {value}
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="ml-1.5 hover:text-[#C26E26] cursor-pointer"
                                        onClick={(e) => handleRemove(value, e)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                handleRemove(value, e as unknown as React.MouseEvent);
                                            }
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </span>
                                </Badge>
                            ))
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[300px] p-0" align="start">
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {options.map((option) => {
                        const isSelected = selected.includes(option);
                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md transition-colors',
                                    isSelected
                                        ? 'bg-[#C26E26]/10 text-[#C26E26]'
                                        : 'hover:bg-gray-100'
                                )}
                            >
                                <div
                                    className={cn(
                                        'h-4 w-4 border rounded flex items-center justify-center',
                                        isSelected
                                            ? 'bg-[#C26E26] border-[#C26E26]'
                                            : 'border-gray-300'
                                    )}
                                >
                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                </div>
                                {option}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
