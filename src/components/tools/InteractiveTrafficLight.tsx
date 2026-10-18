import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Info } from 'lucide-react';
import { calculateLCM } from '../../utils/math';

interface Props {
  defaultIntervalA?: number;
  defaultIntervalB?: number;
}

export const InteractiveTrafficLight: React.FC<Props> = ({
  defaultIntervalA = 2,
  defaultIntervalB = 4,
}) => {
  const [intervalA, setIntervalA] = useState(defaultIntervalA);
  const [intervalB, setIntervalB] = useState(defaultIntervalB);
  const [currentSecond, setCurrentSecond] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<number[]>([]);

  const lcm = calculateLCM(intervalA, intervalB);

  useEffect(() => {
    setIntervalA(defaultIntervalA);
    setIntervalB(defaultIntervalB);
    setCurrentSecond(0);
    setHistory([]);
    setIsRunning(false);
  }, [defaultIntervalA, defaultIntervalB]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setCurrentSecond((prev) => {
          const next = prev + 1;
          if (next % intervalA === 0 && next % intervalB === 0) {
            setHistory((h) => (h.includes(next) ? h : [...h, next]));
          }
          return next;
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isRunning, intervalA, intervalB]);

  const isALit = currentSecond > 0 && currentSecond % intervalA === 0;
  const isBLit = currentSecond > 0 && currentSecond % intervalB === 0;
  const isBothLit = isALit && isBLit;

  const handleStep = () => {
    const next = currentSecond + 1;
    setCurrentSecond(next);
    if (next % intervalA === 0 && next % intervalB === 0) {
      setHistory((h) => (h.includes(next) ? h : [...h, next]));
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentSecond(0);
    setHistory([]);
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DFD8] pb-3 mb-4">
        <div>
          <h4 className="text-base font-bold text-[#3E2723]">Simulasi Laboratorium: Lampu Sinyal</h4>
          <p className="text-xs text-[#6D5A50]">
            Uji titik temu sinyal berkala secara langsung untuk mengamati KPK.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#95634F]">Waktu Simulasi:</span>
          <span className="font-mono text-lg font-bold text-[#3E2723] bg-white px-2.5 py-0.5 border border-[#E8DFD8] rounded">
            {currentSecond} <span className="text-xs font-normal">detik</span>
          </span>
        </div>
      </div>

      {/* Simulator Controls & Lights Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Lights Box */}
        <div className="flex items-center justify-center gap-8 bg-white border border-[#E8DFD8] rounded-xl p-6">
          {/* Light A */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#3E2723] mb-2">Lampu A</span>
            <div className="w-18 bg-[#3E2723] p-3 rounded-2xl flex flex-col items-center gap-3 shadow-inner">
              <div
                className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                  isALit
                    ? 'bg-[#FF913D] border-[#FFE082] shadow-[0_0_15px_#FF913D]'
                    : 'bg-[#5D4037] border-[#4A3228] opacity-60'
                }`}
              />
              <span className="text-[10px] text-[#FFE082] font-mono">
                tiap {intervalA}s
              </span>
            </div>
            <span className="text-xs text-[#6D5A50] mt-2 font-medium">
              {isALit ? '● MENYALA' : '○ Padam'}
            </span>
          </div>

          {/* Sync Indicator */}
          <div className="flex flex-col items-center justify-center text-center px-2">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isBothLit
                  ? 'bg-[#C5E68A] text-[#3E2723] scale-110 shadow-md ring-4 ring-[#FFE082]'
                  : 'bg-[#F2ECE4] text-[#8C7A70]'
              }`}
            >
              <span className="text-xs font-bold">
                {isBothLit ? 'KPK!' : '...'}
              </span>
            </div>
            <span className="text-[11px] font-semibold mt-2 text-[#6D5A50]">
              {isBothLit ? 'Menyala Bersama!' : 'Menunggu sync'}
            </span>
          </div>

          {/* Light B */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#3E2723] mb-2">Lampu B</span>
            <div className="w-18 bg-[#3E2723] p-3 rounded-2xl flex flex-col items-center gap-3 shadow-inner">
              <div
                className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                  isBLit
                    ? 'bg-[#FFE082] border-white shadow-[0_0_15px_#FFE082]'
                    : 'bg-[#5D4037] border-[#4A3228] opacity-60'
                }`}
              />
              <span className="text-[10px] text-[#FFE082] font-mono">
                tiap {intervalB}s
              </span>
            </div>
            <span className="text-xs text-[#6D5A50] mt-2 font-medium">
              {isBLit ? '● MENYALA' : '○ Padam'}
            </span>
          </div>
        </div>

        {/* Control Deck */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-lg transition-colors"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Jeda' : 'Jalankan'}
            </button>
            <button
              onClick={handleStep}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-100 disabled:opacity-50 text-[#3E2723] border border-[#E8DFD8] text-xs font-semibold rounded-lg transition-colors"
            >
              <FastForward className="w-3.5 h-3.5" />
              +1 Detik
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-100 text-[#3E2723] border border-[#E8DFD8] text-xs font-semibold rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Multiples Log */}
          <div className="bg-white border border-[#E8DFD8] rounded-lg p-3 text-xs">
            <div className="flex items-center gap-1.5 text-[#95634F] font-semibold mb-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Titik Detik Menyala Bersama yang Terdeteksi:</span>
            </div>
            {history.length === 0 ? (
              <p className="text-[#8C7A70] italic">
                Jalankan simulasi untuk mendeteksi detik ketika kedua lampu menyala pada saat yang sama.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {history.map((sec) => (
                  <span
                    key={sec}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      sec === lcm
                        ? 'bg-[#C5E68A] text-[#3E2723] border border-[#A8D468]'
                        : 'bg-neutral-100 text-[#6D5A50]'
                    }`}
                  >
                    detik ke-{sec} {sec === lcm ? '(KPK Pertama!)' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-[#8C7A70] leading-relaxed">
            *Catatan: Seluruh waktu merupakan simulasi laboratorium untuk memahami kelipatan persekutuan terkecil, bukan pengaturan nyata jalan raya.
          </p>
        </div>
      </div>
    </div>
  );
};
