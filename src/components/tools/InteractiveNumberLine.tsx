import React, { useState } from 'react';
import { calculateLCM } from '../../utils/math';

interface Props {
  num1: number;
  num2: number;
  maxLimit?: number;
}

export const InteractiveNumberLine: React.FC<Props> = ({ num1, num2, maxLimit }) => {
  const lcm = calculateLCM(num1, num2);
  const limit = maxLimit || Math.max(lcm * 1.5, 30);
  const [highlightNum1, setHighlightNum1] = useState(true);
  const [highlightNum2, setHighlightNum2] = useState(true);

  // Array of numbers from 0 to limit
  const numbers = Array.from({ length: Math.min(limit + 1, 40) }, (_, i) => i);

  return (
    <div className="bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-bold text-[#3E2723]">Garis Bilangan Interaktif</h4>
          <p className="text-xs text-[#6D5A50]">
            Amati lompatan kelipatan {num1} dan {num2} hingga bertemu di titik KPK ({lcm}).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={highlightNum1}
              onChange={(e) => setHighlightNum1(e.target.checked)}
              className="accent-[#FF913D]"
            />
            <span className="font-medium text-[#3E2723]">Kelipatan {num1}</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={highlightNum2}
              onChange={(e) => setHighlightNum2(e.target.checked)}
              className="accent-[#95634F]"
            />
            <span className="font-medium text-[#3E2723]">Kelipatan {num2}</span>
          </label>
        </div>
      </div>

      {/* Horizontal Number Line with Scroll */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[700px] flex items-center relative py-8 px-4">
          {/* Main Axis Line */}
          <div className="absolute left-4 right-4 h-1 bg-[#D8CFC8] rounded-full top-1/2 -translate-y-1/2" />

          {numbers.map((n) => {
            const isMult1 = highlightNum1 && n > 0 && n % num1 === 0;
            const isMult2 = highlightNum2 && n > 0 && n % num2 === 0;
            const isLCM = isMult1 && isMult2;

            return (
              <div
                key={n}
                className="flex-1 flex flex-col items-center relative z-10"
              >
                {/* Upper jump indicator (Num1) */}
                <div className="h-6 flex items-end">
                  {isMult1 && (
                    <span className="text-[10px] font-bold text-[#FF913D] animate-bounce">
                      +{num1}
                    </span>
                  )}
                </div>

                {/* Node on axis */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold transition-all ${
                    isLCM
                      ? 'bg-[#C5E68A] text-[#3E2723] ring-4 ring-[#FFE082] scale-125 z-20 shadow-md'
                      : isMult1
                      ? 'bg-[#FF913D] text-white scale-110'
                      : isMult2
                      ? 'bg-[#95634F] text-white scale-110'
                      : n === 0
                      ? 'bg-[#3E2723] text-white'
                      : 'bg-white text-[#8C7A70] border border-[#D8CFC8]'
                  }`}
                  title={
                    isLCM
                      ? `KPK (${n})! Kelipatan persekutuan terkecil.`
                      : isMult1
                      ? `Kelipatan ${num1}`
                      : isMult2
                      ? `Kelipatan ${num2}`
                      : `${n}`
                  }
                >
                  {n}
                </div>

                {/* Lower jump indicator (Num2) */}
                <div className="h-6 flex items-start mt-1">
                  {isLCM ? (
                    <span className="text-[10px] font-extrabold text-[#3E2723] bg-[#FFE082] px-1 rounded">
                      KPK!
                    </span>
                  ) : isMult2 ? (
                    <span className="text-[10px] font-bold text-[#95634F]">
                      +{num2}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
