import React, { useState } from 'react';

export const NeutralMultiplesTable: React.FC = () => {
  const [selectedNum, setSelectedNum] = useState<number>(2);
  const [maxMultiplier, setMaxMultiplier] = useState<number>(10);

  const numbersToSelect = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18];

  return (
    <div className="bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl p-4 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8DFD8] pb-3">
        <div>
          <h4 className="text-sm font-bold text-[#3E2723]">
            Tabel Bantuan: Penelusuran Kelipatan Bilangan
          </h4>
          <p className="text-xs text-[#6D5A50]">
            Pilih bilangan untuk mengamati deret kelipatan secara mandiri tanpa penanda jawaban.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-[#6D5A50]">Rentang Pengali:</span>
          <select
            value={maxMultiplier}
            onChange={(e) => setMaxMultiplier(parseInt(e.target.value, 10))}
            className="px-2 py-1 bg-white border border-[#D8CFC8] rounded text-xs font-bold text-[#3E2723]"
          >
            <option value={10}>1 – 10</option>
            <option value={15}>1 – 15</option>
            <option value={20}>1 – 20</option>
          </select>
        </div>
      </div>

      {/* Select Number Buttons */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-[#8C7A70] block">
          Pilih Bilangan yang Ingin Ditelusuri:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {numbersToSelect.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelectedNum(n)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                selectedNum === n
                  ? 'bg-[#FF913D] text-white shadow-xs'
                  : 'bg-white hover:bg-neutral-100 text-[#3E2723] border border-[#E8DFD8]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Neutral Clean Table: multiplier x number = multiple */}
      <div className="overflow-x-auto bg-white rounded-lg border border-[#E8DFD8] p-2">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E8DFD8] text-[#8C7A70]">
              <th className="py-1.5 px-2">Urutan</th>
              {Array.from({ length: maxMultiplier }, (_, i) => i + 1).map((m) => (
                <th key={m} className="py-1.5 px-2 font-mono font-normal">
                  × {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-2 font-bold text-[#3E2723] bg-[#FAF8F5] border-r border-[#E8DFD8]">
                Kelipatan {selectedNum}
              </td>
              {Array.from({ length: maxMultiplier }, (_, i) => i + 1).map((m) => (
                <td
                  key={m}
                  className="py-2 px-2 font-mono font-bold text-[#2D231E] border-r border-[#FAF8F5] last:border-r-0"
                >
                  {selectedNum * m}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-[#8C7A70] italic">
        *Gunakan tabel ini untuk mencatat dan membandingkan hasil perkalian bilangan pada catatan kelompokmu.
      </p>
    </div>
  );
};
