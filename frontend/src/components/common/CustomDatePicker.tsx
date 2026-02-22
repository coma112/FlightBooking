import { useState, useRef, useEffect } from "react";
import './CustomDatePicker.css';

interface CustomDatePickerProps {
    value: string; // iso dátum YYYY-MM-DD
    onChange: (value: string) => void; 
    placeholder?: string;
    minDate?: string; // iso dátum YYYY-MM-DD
    maxDate?: string; // iso dátum YYYY-MM-DD
    disabled?: boolean;
    name?: string;
    yearsAhead?: number; // hány évet generáljon előre
}

type ViewMode = "days" | "months" | "years";

const MONTHS_HU = [
    "Január", "Február", "Március", "Április",
    "Május", "Június", "Július", "Augusztus",
    "Szeptember", "Október", "November", "December"
];

const MONTHS_SHORT_HU = [
    "Jan", "Feb", "Már", "Ápr",
    "Máj", "Jún", "Júl", "Aug",
    "Szep", "Okt", "Nov", "Dec"
];

const WEEKDAYS_HU = ["H", "K", "Sz", "Cs", "P", "Szo", "V"];

// hány hétfővel indul ugye ez az ISO 8601
function getDayOfWeekISO(date: Date): number {
    const d = date.getDay();
    return d === 0 ? 6 : d - 1;
}

function isoToDate(iso: string): Date | null {
    if (!iso) return null;

    const [y, m, d] = iso.split('-').map(Number);

    return new Date(y, m - 1, d);
}

function dateToISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function sameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg
        className={`cdp-chevron ${open ? 'cdp-chevron--open' : ''}`}
        width="16" height="16" viewBox="0 0 16 16" fill="none"
    >
        <path
            d="M3 6L8 11L13 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="cdp-trigger-icon">
        <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M1.5 7H14.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

const CustomDatePicker = ({
    value,
    onChange,
    placeholder = "Válasszon dátumot...",
    minDate,
    maxDate,
    disabled = false,
    name,
    yearsAhead = 10,
}: CustomDatePickerProps) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = isoToDate(value);

    const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
    const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());
    const [viewMode, setViewMode] = useState<ViewMode>("days");
    const [open, setOpen] = useState(false);
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

    const ref = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const minD = minDate ? isoToDate(minDate) : null;
    const maxD = maxDate ? isoToDate(maxDate) : null;

    const currentYear = today.getFullYear();
    const startYear = minD ? minD.getFullYear() : currentYear;
    const endYear = maxD ? maxD.getFullYear() : currentYear + yearsAhead;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setViewMode("days");
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        const close = () => {
            setOpen(false);
            setViewMode("days");
        };
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => {
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, []);

    useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPanelStyle({
                top: rect.bottom,
                left: rect.left,
                width: rect.width,
            });
        }
    }, [open]);

    useEffect(() => {
        if (selectedDate) {
            setViewYear(selectedDate.getFullYear());
            setViewMonth(selectedDate.getMonth());
        }
    }, [value]);

    function buildDays() {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const startOffset = getDayOfWeekISO(firstDay);

        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

        const cells: Array<{
            date: Date;
            currentMonth: boolean;
            dayNum: number;
        }> = [];

        for (let i = startOffset - 1; i >= 0; i--) {
            cells.push({
                date: new Date(viewYear, viewMonth - 1, prevMonthDays - i),
                currentMonth: false,
                dayNum: prevMonthDays - i,
            });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({
                date: new Date(viewYear, viewMonth, d),
                currentMonth: true,
                dayNum: d,
            });
        }

        const remaining = 42 - cells.length;

        for (let d = 1; d <= remaining; d++) {
            cells.push({
                date: new Date(viewYear, viewMonth + 1, d),
                currentMonth: false,
                dayNum: d,
            });
        }

        return cells;
    }

    function isDayDisabled(date: Date): boolean {
        if (minD && date < minD) return true;
        if (maxD && date > maxD) return true;
        return false;
    }

    function handleDayClick(date: Date) {
        if (isDayDisabled(date)) return;
        onChange(dateToISO(date));
        setOpen(false);
        setViewMode("days");
    }

    function prevMonth() {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(y => y - 1);
        } else {
            setViewMonth(m => m - 1);
        }
    }

    function nextMonth() {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(y => y + 1);
        } else {
            setViewMonth(m => m + 1);
        }
    }

    function goToToday() {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        setViewMode("days");

        if (!isDayDisabled(today)) {
            onChange(dateToISO(today));
            setOpen(false);
        }
    }

    function clearValue() {
        onChange("");
    }

    function formatDisplayDate(iso: string): string {
        const d = isoToDate(iso);

        if (!d) return "";

        return d.toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "long",
            day: "numeric", 
        });
    }

    function formatWeekdayLabel(iso: string): string {
        const d = isoToDate(iso);
        if (!d) return "";

        return d.toLocaleDateString("hu-HU", { weekday: "long" });
    }

    const days = buildDays();

    const isPrevMonthDisabled = minD
        ? viewYear < minD.getFullYear() || (viewYear === minD.getFullYear() && viewMonth <= minD.getMonth())
        : false;

    const isNextMonthDisabled = maxD
        ? viewYear > maxD.getFullYear() || (viewYear === maxD.getFullYear() && viewMonth >= maxD.getMonth())
        : false;
    

    return (
        <div className={`cdp-root ${disabled ? 'cdp-root--disabled' : ''}`} ref={ref}>
            {name && <input type="hidden" name={name} value={value} />}

            <button
                ref={triggerRef}
                type="button"
                className={`cdp-trigger ${open ? 'cdp-trigger--open' : ''}`}
                onClick={() => !disabled && setOpen(p => !p)}
                disabled={disabled}
            >
                <span className="cdp-trigger-content">
                    <CalendarIcon />
                    {value ? (
                        <span className="cdp-trigger-text">
                            <span className="cdp-trigger-label">{formatDisplayDate(value)}</span>
                            <span className="cdp-trigger-sub">{formatWeekdayLabel(value)}</span>
                        </span>
                    ) : (
                        <span className="cdp-trigger-placeholder">{placeholder}</span>
                    )}
                </span>
                <ChevronIcon open={open} />
            </button>

            {open && (
                <div className="cdp-panel" style={panelStyle}>
                    <div className="cdp-nav">
                        <button
                            type="button"
                            className="cdp-nav-btn"
                            onClick={prevMonth}
                            disabled={isPrevMonthDisabled || viewMode !== "days"}
                            title="Előző hónap"
                        >
                            ‹
                        </button>

                        <div className="cdp-nav-center">
                            <button
                                type="button"
                                className={`cdp-nav-month-btn ${viewMode === 'months' ? 'cdp-nav-month-btn--active' : ''}`}
                                onClick={() => setViewMode(m => m === "months" ? "days" : "months")}
                            >
                                {MONTHS_HU[viewMonth]}
                            </button>
                            <span className="cdp-nav-sep">·</span>
                            <button
                                type="button"
                                className={`cdp-nav-year-btn ${viewMode === "years" ? "cdp-nav-year-btn--active" : ''}`}
                                onClick={() => setViewMode(m => m === "years" ? "days" : "years")}
                            >
                                {viewYear}
                            </button>
                        </div>

                        <button
                            type="button"
                            className="cdp-nav-btn"
                            onClick={nextMonth}
                            disabled={isNextMonthDisabled || viewMode !== "days"}
                            title="Következő hónap"
                        >
                            ›
                        </button>
                    </div>

                    {viewMode === "months" && (
                        <div className="cdp-month-grid">
                            {MONTHS_SHORT_HU.map((m, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`cdp-month-opt ${i === viewMonth ? 'cdp-month-opt--active' : ''}`}
                                    onClick={() => {
                                        setViewMonth(i);
                                        setViewMode("days");
                                    }}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    )}

                    {viewMode === "years" && (
                        <div className="cdp-year-scroll">
                            {years.map(y => (
                                <button
                                    key={y}
                                    type="button"
                                    className={`cdp-year-opt ${y === viewYear ? 'cdp-year-opt--active': ''}`}
                                    onClick={() => {
                                        setViewYear(y);
                                        setViewMode("days");
                                    }}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    )}

                    {viewMode === "days" && (
                        <>
                            <div className="cdp-weekdays">
                                {WEEKDAYS_HU.map((d, i) => (
                                    <div
                                        key={d}
                                        className={`cdp-weekday ${i >= 5 ? 'cdp-weekday--weekend' : ''}`}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="cdp-days">
                                {days.map(({ date, currentMonth, dayNum }, idx) => {
                                    const isSelected = selectedDate ? sameDay(date, selectedDate) : false;
                                    const isToday = sameDay(date, today);
                                    const disabled = isDayDisabled(date);
                                    const dowISO = getDayOfWeekISO(date);
                                    const isWeekend = dowISO >= 5;

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            className={[
                                                "cdp-day",
                                                !currentMonth ? 'cdp-day--other-month' : '',
                                                isToday && !isSelected ? 'cdp-day--today' : '',
                                                isSelected ? 'cdp-day--selected' : '',
                                                isWeekend && currentMonth ? 'cdp-day-weekend' : '',
                                            ].filter(Boolean).join(' ')}
                                            onClick={() => handleDayClick(date)}
                                            disabled={disabled}
                                            title={date.toLocaleDateString("hu-HU", {
                                                year: "numeric", month: "long", day: "numeric",
                                            })}
                                        >
                                            {dayNum}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className="cdp-footer">
                        <button type="button" className="cdp-today-btn" onClick={goToToday}>
                            Ma
                        </button>
                        {value && (
                            <button type="button" className="cdp-clear-btn" onClick={clearValue}>
                                Törlés
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;