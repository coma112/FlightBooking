import { useState, useRef, useEffect, type ReactNode } from 'react';
import './CustomSelect.css';
import { FaCheck } from 'react-icons/fa';
import { FaChevronUp } from "react-icons/fa6";

export interface SelectOption {
    value: string;
    label: string;
    sublabel?: string;
    icon?: string | ReactNode;
    description?: string;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
    name?: string;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <FaChevronUp className={`cs-chevron ${open ? 'cs-chevron--open' : ''}`}/>
);

const CustomSelect = ({ 
    options,
    value,
    onChange,
    placeholder = "Válasszon...",
    searchable = false,
    disabled = false,
    name,
}: CustomSelectProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = options.find(o => o.value === value);

    const filtered = searchable
        ? options.filter(
            o =>
                o.label.toLowerCase().includes(search.toLowerCase()) ||
            (o.sublabel?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
            o.value.toLowerCase().includes(search.toLowerCase())
        )
        : options;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open && searchable && inputRef.current) inputRef.current.focus();
        if (!open) setSearch('');
    }, [open, searchable]);

    const handleSelect = (val: string) => {
        onChange(val);
        setOpen(false);
    };

    return (
        <div className={`cs-root ${disabled ? 'cs-root--disabled' : ''}`} ref={ref}>
            {name && <input type="hidden" name={name} value={value} />}

            <button
                type="button"
                className={`cs-trigger ${open ? 'cs-trigger--open' : ''}`}
                onClick={() => !disabled && setOpen(p => !p)}
                disabled={disabled}
            >
                <span className="cs-trigger-content">
                    {selected ? (
                        <>
                            {selected.icon && (
                                <span className="cs-trigger-icon">{selected.icon}</span>
                            )}
                            <span className="cs-trigger-text">
                                <span className="cs-trigger-label">{selected.label}</span>
                                {selected.sublabel && (
                                    <span className="cs-trigger-sub">{selected.sublabel}</span>
                                )}
                            </span>
                        </>
                    ) : (
                        <span className="cs-trigger-placeholder">{placeholder}</span>
                    )}
                </span>
                <ChevronIcon open={open} />
            </button>

            {open && (
                <div className="cs-panel">
                    {searchable && (
                        <div className="cs-search-wrap">
                        <svg className="cs-search-icon" viewBox="0 0 20 20" fill="none">
                            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <input 
                            ref={inputRef}
                            className="cs-search-input"
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Keresés..." 
                        />
                        </div>
                    )}

                    <div className="cs-list">
                        {filtered.length === 0 ? (
                            <div className="cs-empty">Nincs találat</div>
                        ) : (
                            filtered.map(opt => {
                                const isActive = opt.value === value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`cs-option ${isActive ? 'cs-option--active' : ''}`}
                                        onClick={() => handleSelect(opt.value)}
                                    >
                                        {opt.icon && (
                                            <span className="cs-option-icon">{opt.icon}</span>
                                        )}

                                        <span className="cs-option-body">
                                            <span className="cs-option-label">{opt.label}</span>
                                            {opt.sublabel && (
                                                <span className="cs-option-sub">{opt.sublabel}</span>
                                            )}
                                            {opt.description && (
                                                <span className="cs-option-desc">{opt.description}</span>
                                            )}
                                        </span>
                                        {opt.sublabel && !opt.description && (
                                            <span className="cs-option-badge">{opt.value}</span>
                                        )}
                                        {isActive && <span className="cs-check"><FaCheck /></span>}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;