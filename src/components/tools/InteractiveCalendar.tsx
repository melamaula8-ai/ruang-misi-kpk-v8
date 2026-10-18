import React from 'react';
import { parseIndonesianDate, addDaysToDate, DAYS_IN_MONTH, INDONESIAN_MONTHS } from '../../utils/math';

interface Props {
  startDateStr?: string;
  daysToAdd?: number;
}

export const InteractiveCalendar: React.FC<Props> = ({
  startDateStr = '1 Agustus',
  daysToAdd = 6,
}) => {
  const parsed = parseIndonesianDate(startDateStr);
  const target = addDaysToDate(startDateStr, daysToAdd);

  if (!parsed) {
    return null;
  }

  const startMonthIndex = parsed.monthIndex;
  const startMonthName = INDONESIAN_MONTHS[startMonthIndex];
  const daysInStartMonth = DAYS_IN_MONTH[startMonthIndex];

  // Target month
  const targetParsed = parseIndonesianDate(target.formatted);
  const targetMonthIndex = targetParsed ? targetParsed.monthIndex : startMonthIndex;
  const targetMonthName = target.monthName;
  const daysInTargetMonth = DAYS_IN_MONTH[targetMonthIndex];

  const isCrossMonth = targetMonthIndex !== startMonthIndex;

  return (
    <div className="bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-bold text-[#3E2723]">Kalender Penelusuran Tanggal</h4>
          <p className="text-xs text-[#6D5A50]">
            Mulai: <span className="font-semibold text-[#FF913D]">{startDateStr}</span> +{' '}
            <span className="font-semibold text-[#95634F]">{daysToAdd} hari (KPK)</span> ={' '}
            <span className="font-bold text-[#3E2723] bg-[#C5E68A] px-1.5 py-0.5 rounded">
              {target.formatted}
            </span>
          </p>
        </div>
      </div>

      <div className={`grid ${isCrossMonth ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {/* Start Month Calendar */}
        <div className="bg-white border border-[#E8DFD8] rounded-lg p-3">
          <div className="text-xs font-bold text-center text-[#3E2723] border-b border-[#E8DFD8] pb-1.5 mb-2">
            Bulan {startMonthName} ({daysInStartMonth} Hari)
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <span key={d} className="text-[10px] font-semibold text-[#95634F]">
                {d}
              </span>
            ))}
            {Array.from({ length: daysInStartMonth }, (_, i) => i + 1).map((day) => {
              const isStart = day === parsed.day;
              const isTargetHere = !isCrossMonth && day === target.day;
              const isInRange =
                !isCrossMonth && day > parsed.day && day < target.day;

              let style = 'bg-[#FAF8F5] text-[#6D5A50]';
              if (isStart) {
                style = 'bg-[#FF913D] text-white font-bold ring-2 ring-[#FFE082] shadow-xs';
              } else if (isTargetHere) {
                style = 'bg-[#C5E68A] text-[#2D231E] font-extrabold ring-2 ring-[#FF913D] shadow-xs';
              } else if (isInRange) {
                style = 'bg-[#FFE082]/40 text-[#5D4037] font-medium';
              }

              return (
                <div
                  key={day}
                  className={`h-7 rounded flex items-center justify-center font-mono text-[11px] ${style}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Month Calendar if cross-month */}
        {isCrossMonth && (
          <div className="bg-white border border-[#E8DFD8] rounded-lg p-3">
            <div className="text-xs font-bold text-center text-[#3E2723] border-b border-[#E8DFD8] pb-1.5 mb-2">
              Bulan {targetMonthName} {target.isNextYear ? '(Tahun Berikutnya)' : ''} ({daysInTargetMonth} Hari)
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                <span key={d} className="text-[10px] font-semibold text-[#95634F]">
                  {d}
                </span>
              ))}
              {Array.from({ length: daysInTargetMonth }, (_, i) => i + 1).map((day) => {
                const isTargetHere = day === target.day;
                const isInRange = day < target.day;

                let style = 'bg-[#FAF8F5] text-[#6D5A50]';
                if (isTargetHere) {
                  style = 'bg-[#C5E68A] text-[#2D231E] font-extrabold ring-2 ring-[#FF913D] shadow-xs';
                } else if (isInRange) {
                  style = 'bg-[#FFE082]/40 text-[#5D4037] font-medium';
                }

                return (
                  <div
                    key={day}
                    className={`h-7 rounded flex items-center justify-center font-mono text-[11px] ${style}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
