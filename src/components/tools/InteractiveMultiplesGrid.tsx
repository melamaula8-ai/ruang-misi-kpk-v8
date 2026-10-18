import React, { useState } from 'react';
import { calculateLCM } from '../../utils/math';

interface Props {
  num1: number;
  num2: number;
  max?: number;
}

export const InteractiveMultiplesGrid: React.FC<Props> = ({ num1, num2, max = 50 }) => {
  const [activeNum1, setActiveNum1] = useState(true);
  const [activeNum2, setActiveNum2] = useState(true);

  const lcm = calculateLCM(num1, num2);
  const numbers = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-bold text-[#3E2723]">Tabel Kelipatan Interaktif (1 – {max})</h4>
          <p className="text-xs text-[#6D5A50]">
            Bandingkan letak kelipatan {num1} dan {num2} secara menyeluruh.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveNum1(!activeNum1)}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              activeNum1
                ? 'bg-[#FF913D] text-white'
                : 'bg-white text-[#6D5A50] border border-[#E8DFD8]'
            }`}
          >
            Kelipatan {num1}
          </button>
          <button
            type="button"
            onClick={() => setActiveNum2(!activeNum2)}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              activeNum2
                ? 'bg-[#95634F] text-white'
                : 'bg-white text-[#6D5A50] border border-[#E8DFD8]'
            }`}
          >
            Kelipatan {num2}
          </button>
        </div>
      </div>

      {/* Grid of Numbers */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5 p-2 bg-white rounded-lg border border-[#E8DFD8]">
        {numbers.map((n) => {
          const isM1 = activeNum1 && n % num1 === 0;
          const isM2 = activeNum2 && n % num2 === 0;
          const isCommon = isM1 && isM2;
          const isFirstCommon = n === lcm;

          let bgClass = 'bg-[#FAF8F5] text-[#6D5A50] border-transparent';
          if (isCommon) {
            bgClass = isFirstCommon
              ? 'bg-[#C5E68A] text-[#2D231E] font-extrabold ring-2 ring-[#FF913D] shadow-xs'
              : 'bg-[#FFE082] text-[#2D231E] font-bold';
          } else if (isM1) {
            bgClass = 'bg-[#FF913D]/20 text-[#D86B1E] font-semibold border-[#FF913D]/40';
          } else if (isM2) {
            bgClass = 'bg-[#95634F]/20 text-[#6F4736] font-semibold border-[#95634F]/40';
          }

          return (
            <div
              key={n}
              className={`h-7 sm:h-8 rounded flex items-center justify-center font-mono text-xs border transition-all ${bgClass}`}
              title={
                isFirstCommon
                  ? `Angka ${n} adalah KPK!`
                  : isCommon
                  ? `Angka ${n} adalah Kelipatan Persekutuan`
                  : undefined
              }
            >
              {n}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-[#6D5A50]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#FF913D]/30 border border-[#FF913D]/50" />
          <span>Kelipatan {num1}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#95634F]/30 border border-[#95634F]/50" />
          <span>Kelipatan {num2}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#C5E68A] ring-1 ring-[#FF913D]" />
          <span className="font-semibold text-[#2D231E]">KPK Terkecil ({lcm})</span>
        </div>
      </div>
    </div>
  );
};
