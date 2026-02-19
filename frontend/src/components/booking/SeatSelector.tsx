import { useEffect, useState, useMemo } from 'react';
import './SeatSelector.css';
import { MdClose } from 'react-icons/md';
import type { SeatResponse } from '../../services/api';
import { flightApi } from '../../services/api';

type SeatClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';
type FilterClass = SeatClass | 'ALL';

interface SeatSelectorProps {
  flightId: number;
  flightNumber: string;
  departureCode: string;
  arrivalCode: string;
  seatClass: SeatClass;
  onConfirm: (seat: SeatResponse) => void;
  onClose: () => void;
}

const CLASS_COLUMNS: Record<SeatClass, string[]> = {
  FIRST:    ['A', 'C', 'D', 'F'],           // 2-2  (széles ülések, 4 cols)
  BUSINESS: ['A', 'C', 'D', 'F'],           // 2-2
  ECONOMY:  ['A', 'B', 'C', 'D', 'E', 'F'] // 3-3
};

const AISLE_AFTER: Record<SeatClass, string> = {
  FIRST: 'C', BUSINESS: 'C', ECONOMY: 'C'
};

const EMERGENCY_ROWS: Record<SeatClass, number[]> = {
  FIRST: [], BUSINESS: [], ECONOMY: [15, 27]
};

interface SeatCell {
  seatNumber: string;
  col: string;
  row: number;
  seatClass: SeatClass;
  available: boolean;
  price: number;
}

function buildSeatMap(seats: SeatResponse[]): Map<string, SeatCell> {
  const map = new Map<string, SeatCell>();
  for (const s of seats) {
    const match = s.seatNumber.match(/^(\d+)([A-F])$/);
    if (!match) continue;
    const row = parseInt(match[1]);
    const col = match[2];
    map.set(s.seatNumber, {
      seatNumber: s.seatNumber,
      col,
      row,
      seatClass: s.seatClass,
      available: s.available,
      price: s.price,
    });
  }
  return map;
}

function getRowRanges(seats: SeatResponse[]): { cls: SeatClass; minRow: number; maxRow: number }[] {
  const ranges: Record<SeatClass, { min: number; max: number }> = {
    FIRST:    { min: Infinity, max: -Infinity },
    BUSINESS: { min: Infinity, max: -Infinity },
    ECONOMY:  { min: Infinity, max: -Infinity },
  };
  for (const s of seats) {
    const match = s.seatNumber.match(/^(\d+)/);
    if (!match) continue;
    const r = parseInt(match[1]);
    if (r < ranges[s.seatClass].min) ranges[s.seatClass].min = r;
    if (r > ranges[s.seatClass].max) ranges[s.seatClass].max = r;
  }
  return (['FIRST', 'BUSINESS', 'ECONOMY'] as SeatClass[])
    .filter(c => ranges[c].min !== Infinity)
    .map(c => ({ cls: c, minRow: ranges[c].min, maxRow: ranges[c].max }));
}

const CLASS_LABEL: Record<SeatClass, string> = {
  FIRST: 'FIRST CLASS', BUSINESS: 'BUSINESS', ECONOMY: 'ECONOMY'
};

const SeatSelector = ({
  flightId,
  flightNumber,
  departureCode,
  arrivalCode,
  seatClass,
  onConfirm,
  onClose,
}: SeatSelectorProps) => {
  const [allSeats, setAllSeats] = useState<SeatResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<FilterClass>(seatClass);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [first, business, economy] = await Promise.all([
          flightApi.getAvailableSeats(flightId, 'FIRST').catch(() => []),
          flightApi.getAvailableSeats(flightId, 'BUSINESS').catch(() => []),
          flightApi.getAvailableSeats(flightId, 'ECONOMY').catch(() => []),
        ]);
        setAllSeats([...first, ...business, ...economy]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [flightId]);

  const seatMap = useMemo(() => buildSeatMap(allSeats), [allSeats]);
  const rowRanges = useMemo(() => getRowRanges(allSeats), [allSeats]);

  const allCells = useMemo(() => {
    const cells: SeatCell[] = [];
    for (const { cls, minRow, maxRow } of rowRanges) {
      const cols = CLASS_COLUMNS[cls];
      for (let row = minRow; row <= maxRow; row++) {
        for (const col of cols) {
          const key = `${row}${col}`;
          const real = seatMap.get(key);
          cells.push(real ?? {
            seatNumber: key,
            col,
            row,
            seatClass: cls,
            available: false,
            price: 0,
          });
        }
      }
    }
    return cells;
  }, [seatMap, rowRanges]);

  const rowsGrouped = useMemo(() => {
    const map = new Map<number, SeatCell[]>();
    for (const cell of allCells) {
      const arr = map.get(cell.row) ?? [];
      arr.push(cell);
      map.set(cell.row, arr);
    }
    return map;
  }, [allCells]);

  const rowClassMap = useMemo(() => {
    const m = new Map<number, SeatClass>();
    for (const { cls, minRow, maxRow } of rowRanges) {
      for (let r = minRow; r <= maxRow; r++) m.set(r, cls);
    }
    return m;
  }, [rowRanges]);

  const selectedCell = selected ? (seatMap.get(selected) ?? null) : null;

  const handleSeatClick = (cell: SeatCell) => {
    if (!cell.available) return;
    setSelected(prev => prev === cell.seatNumber ? null : cell.seatNumber);
  };

  const handleConfirm = () => {
    if (!selectedCell) return;
    const seat = allSeats.find(s => s.seatNumber === selectedCell.seatNumber);
    if (seat) onConfirm(seat);
  };

  const sortedRows = useMemo(() =>
    [...rowsGrouped.keys()].sort((a, b) => a - b),
    [rowsGrouped]
  );

  const existingClasses = useMemo(() =>
    rowRanges.map(r => r.cls),
    [rowRanges]
  );

  const shownSections = new Set<SeatClass>();

  return (
    <div className="seat-selector-overlay" onClick={onClose}>
      <div className="seat-selector-panel" onClick={e => e.stopPropagation()}>

        <div className="ss-header">
          <div className="ss-header-left">
            <h2>Ülőhely kiválasztása</h2>
            <div className="ss-flight-info">
              {flightNumber} &nbsp;·&nbsp; {departureCode} → {arrivalCode}
            </div>
          </div>
          <button className="ss-close" onClick={onClose}><MdClose /></button>
        </div>

        <div className="ss-legend">
          <div className="legend-item">
            <div className="legend-seat available-economy" />
            Economy
          </div>
          <div className="legend-item">
            <div className="legend-seat available-business" />
            Business
          </div>
          {existingClasses.includes('FIRST') && (
            <div className="legend-item">
              <div className="legend-seat available-first" />
              First
            </div>
          )}
          <div className="legend-item">
            <div className="legend-seat occupied" />
            Foglalt
          </div>
          <div className="legend-item">
            <div className="legend-seat selected" />
            Kiválasztott
          </div>
        </div>

        <div className="ss-class-filter">
          <button
            className={`class-filter-btn ${filterClass === 'ALL' ? 'active all' : ''}`}
            onClick={() => setFilterClass('ALL')}
          >
            Összes
          </button>
          {existingClasses.map(cls => (
            <button
              key={cls}
              className={`class-filter-btn ${filterClass === cls ? `active ${cls.toLowerCase()}` : ''}`}
              onClick={() => setFilterClass(cls)}
            >
              {CLASS_LABEL[cls]}
            </button>
          ))}
        </div>

        <div className="ss-cabin-scroll">
          {loading ? (
            <div className="ss-loading">
              <div className="ss-loading-spinner" />
              <p>Ülőhelyek betöltése...</p>
            </div>
          ) : (
            <div className="cabin-container">
              <div className="aircraft-nose">
                <svg className="nose-svg" viewBox="0 0 60 80" fill="none">
                  <path d="M30 2 C15 20, 5 40, 5 60 L55 60 C55 40, 45 20, 30 2Z"
                        fill="rgba(201,168,76,0.08)" stroke="rgba(201,168,76,0.3)" strokeWidth="1.5"/>
                  <line x1="30" y1="10" x2="30" y2="58" stroke="rgba(201,168,76,0.2)" strokeWidth="1"/>
                </svg>
              </div>

              {sortedRows.map(rowNum => {
                const cells = rowsGrouped.get(rowNum)!;
                const rowCls = rowClassMap.get(rowNum)!;
                const isDimmed = filterClass !== 'ALL' && filterClass !== rowCls;
                const isEmergency = EMERGENCY_ROWS[rowCls]?.includes(rowNum);
                const cols = CLASS_COLUMNS[rowCls];
                const aisleAfter = AISLE_AFTER[rowCls];
                const showSection = !shownSections.has(rowCls);
                if (showSection) shownSections.add(rowCls);

                return (
                  <div key={rowNum} style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {showSection && (
                      <div className={`cabin-section-label ${rowCls.toLowerCase()}`}>
                        <span>{CLASS_LABEL[rowCls]}</span>
                        <div className="section-line" />
                      </div>
                    )}

                    {isEmergency && (
                      <div className="emergency-row">
                        <div className="emergency-label">
                          <span className="emergency-icon">🚪</span>
                          Vészkijárat
                          <span className="emergency-icon">🚪</span>
                        </div>
                      </div>
                    )}

                    <div className={`seat-row ${isDimmed ? 'dimmed' : ''}`}>
                      <div className="row-number">{rowNum}</div>

                      {cols.map((col, ci) => {
                        const cell = cells.find(c => c.col === col) ?? {
                          seatNumber: `${rowNum}${col}`,
                          col,
                          row: rowNum,
                          seatClass: rowCls,
                          available: false,
                          price: 0,
                        };
                        const isSelected = selected === cell.seatNumber;

                        const seatCls = isSelected
                          ? 'selected'
                          : cell.available
                          ? `available ${cell.seatClass.toLowerCase()}`
                          : 'occupied';

                        return (
                          <>
                            {ci > 0 && cols[ci - 1] === aisleAfter && (
                              <div key={`aisle-${rowNum}`} className="aisle-gap">
                                <div className="aisle-line" />
                              </div>
                            )}
                            <button
                              key={cell.seatNumber}
                              className={`seat-btn ${seatCls}`}
                              onClick={() => handleSeatClick(cell)}
                              disabled={!cell.available}
                              title={cell.available ? `${cell.seatNumber} – ${cell.seatClass}` : 'Foglalt'}
                            >
                              <span className="seat-label">{col}</span>
                            </button>
                          </>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div style={{ height: '1.5rem' }} />
            </div>
          )}
        </div>

        <div className="ss-footer">
          <div className="ss-selection-info">
            <div className="ss-selected-label">Kiválasztott szék</div>
            <div className="ss-selected-value">
              {selectedCell ? selectedCell.seatNumber : '—'}
            </div>
            {selectedCell && (
              <div className="ss-selected-price">
                {selectedCell.price.toLocaleString('hu-HU')} Ft
              </div>
            )}
          </div>

          <button
            className="ss-confirm-btn"
            disabled={!selectedCell}
            onClick={handleConfirm}
          >
            {selectedCell ? `Megerősítés – ${selectedCell.seatNumber}` : 'Válasszon széket'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SeatSelector;