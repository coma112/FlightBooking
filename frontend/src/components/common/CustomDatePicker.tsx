import { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { FaChevronUp } from "react-icons/fa6";
import { FaCalendarAlt, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import './CustomDatePicker.css';

interface CustomDatePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minDate?: string;
    maxDate?: string;
    disabled?: boolean;
    name?: string;
    yearsAhead?: number;
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
    <FaChevronUp className={`cdp-chevron ${open ? 'cdp-chevron--open' : ''}`} />
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

    const getDefaultView = () => {
        if (selectedDate) return { year: selectedDate.getFullYear(), month: selectedDate.getMonth() };
        const maxD_ = maxDate ? isoToDate(maxDate) : null;
        const minD_ = minDate ? isoToDate(minDate) : null;
        if (maxD_ && today > maxD_) return { year: maxD_.getFullYear(), month: maxD_.getMonth() };
        if (minD_ && today < minD_) return { year: minD_.getFullYear(), month: minD_.getMonth() };
        return { year: today.getFullYear(), month: today.getMonth() };
    };
    const defaultView = getDefaultView();
    const [viewYear, setViewYear] = useState(defaultView.year);
    const [viewMonth, setViewMonth] = useState(defaultView.month);
    const [viewMode, setViewMode] = useState<ViewMode>("days");
    const [open, setOpen] = useState(false);
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const minD = minDate ? isoToDate(minDate) : null;
    const maxD = maxDate ? isoToDate(maxDate) : null;

    const currentYear = today.getFullYear();
    const startYear = minD ? minD.getFullYear() : currentYear - 100;
    const endYear = maxD ? maxD.getFullYear() : currentYear + yearsAhead;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    const updatePanelPosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const panelHeight = panelRef.current?.offsetHeight ?? 320;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let top: number;
        if (spaceBelow >= panelHeight + 8 || spaceBelow >= spaceAbove) {
            top = rect.bottom + window.scrollY;
        } else {
            top = rect.top + window.scrollY - panelHeight - 4;
        }

        setPanelStyle({
            position: 'absolute',
            top,
            left: rect.left + window.scrollX,
            width: rect.width,
            zIndex: 9999,
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target)) return; 
            if (panelRef.current?.contains(target)) return;
            setOpen(false);
            setViewMode("days");
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = () => updatePanelPosition();
        window.addEventListener('scroll', handler, true);
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [open, updatePanelPosition]);

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => updatePanelPosition());
        }
    }, [open, viewMode, updatePanelPosition]);

    useEffect(() => {
        if (selectedDate) {
            setViewYear(selectedDate.getFullYear());
            setViewMonth(selectedDate.getMonth());
        }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    function buildDays() {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const startOffset = getDayOfWeekISO(firstDay);
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

        const cells: Array<{ date: Date; currentMonth: boolean; dayNum: number }> = [];

        for (let i = startOffset - 1; i >= 0; i--) {
            cells.push({ date: new Date(viewYear, viewMonth - 1, prevMonthDays - i), currentMonth: false, dayNum: prevMonthDays - i });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ date: new Date(viewYear, viewMonth, d), currentMonth: true, dayNum: d });
        }
        const remaining = 42 - cells.length;
        for (let d = 1; d <= remaining; d++) {
            cells.push({ date: new Date(viewYear, viewMonth + 1, d), currentMonth: false, dayNum: d });
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
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
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
        return d.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" });
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

    const handleTriggerClick = () => {
        if (disabled) return;
        if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const estimatedPanelHeight = 320;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const top = (spaceBelow >= estimatedPanelHeight + 8 || spaceBelow >= spaceAbove)
                ? rect.bottom + window.scrollY
                : rect.top + window.scrollY - estimatedPanelHeight - 4;
            setPanelStyle({
                position: 'absolute',
                top,
                left: rect.left + window.scrollX,
                width: rect.width,
                zIndex: 9999,
            });
        }
        setOpen(prev => !prev);
    };

    return (
        <div className={`cdp-root ${disabled ? 'cdp-root--disabled' : ''}`} ref={rootRef}>
            {name && <input type="hidden" name={name} value={value} />}

            <button
                ref={triggerRef}
                type="button"
                className={`cdp-trigger ${open ? 'cdp-trigger--open' : ''}`}
                onClick={handleTriggerClick}
                disabled={disabled}
            >
                <span className="cdp-trigger-content">
                    <FaCalendarAlt className="cdp-trigger-icon" />
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

            {open && ReactDOM.createPortal(
                <div className="cdp-panel" style={panelStyle} ref={panelRef}>
                    <div className="cdp-nav">
                        <button
                            type="button"
                            className="cdp-nav-btn"
                            onClick={prevMonth}
                            disabled={isPrevMonthDisabled || viewMode !== "days"}
                            title="Előző hónap"
                        ><FaArrowLeft /></button>

                        <div className="cdp-nav-center">
                            <button
                                type="button"
                                className={`cdp-nav-month-btn ${viewMode === 'months' ? 'cdp-nav-month-btn--active' : ''}`}
                                onClick={() => setViewMode(m => m === "months" ? "days" : "months")}
                            >{MONTHS_HU[viewMonth]}</button>
                            <span className="cdp-nav-sep">·</span>
                            <button
                                type="button"
                                className={`cdp-nav-year-btn ${viewMode === "years" ? "cdp-nav-year-btn--active" : ''}`}
                                onClick={() => setViewMode(m => m === "years" ? "days" : "years")}
                            >{viewYear}</button>
                        </div>

                        <button
                            type="button"
                            className="cdp-nav-btn"
                            onClick={nextMonth}
                            disabled={isNextMonthDisabled || viewMode !== "days"}
                            title="Következő hónap"
                        ><FaArrowRight /></button>
                    </div>

                    {viewMode === "months" && (
                        <div className="cdp-month-grid">
                            {MONTHS_SHORT_HU.map((m, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`cdp-month-opt ${i === viewMonth ? 'cdp-month-opt--active' : ''}`}
                                    onClick={() => { setViewMonth(i); setViewMode("days"); }}
                                >{m}</button>
                            ))}
                        </div>
                    )}

                    {viewMode === "years" && (
                        <div className="cdp-year-scroll">
                            {years.map(y => (
                                <button
                                    key={y}
                                    type="button"
                                    className={`cdp-year-opt ${y === viewYear ? 'cdp-year-opt--active' : ''}`}
                                    onClick={() => { setViewYear(y); setViewMode("days"); }}
                                >{y}</button>
                            ))}
                        </div>
                    )}

                    {viewMode === "days" && (
                        <>
                            <div className="cdp-weekdays">
                                {WEEKDAYS_HU.map((d, i) => (
                                    <div key={d} className={`cdp-weekday ${i >= 5 ? 'cdp-weekday--weekend' : ''}`}>{d}</div>
                                ))}
                            </div>
                            <div className="cdp-days">
                                {days.map(({ date, currentMonth, dayNum }, idx) => {
                                    const isSelected = selectedDate ? sameDay(date, selectedDate) : false;
                                    const isToday = sameDay(date, today);
                                    const isDisabled = isDayDisabled(date);
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
                                                isWeekend && currentMonth ? 'cdp-day--weekend' : '',
                                            ].filter(Boolean).join(' ')}
                                            onClick={() => handleDayClick(date)}
                                            disabled={isDisabled}
                                            title={date.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" })}
                                        >{dayNum}</button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className="cdp-footer">
                        <button type="button" className="cdp-today-btn" onClick={goToToday}>Ma</button>
                        {value && (
                            <button type="button" className="cdp-clear-btn" onClick={clearValue}>Törlés</button>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CustomDatePicker;