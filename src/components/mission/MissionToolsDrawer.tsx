import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Table } from 'lucide-react';
import type { MissionQuestion } from '../../types';
import { NeutralMultiplesTable } from '../tools/NeutralMultiplesTable';

interface Props { question: MissionQuestion; activeStep: 'step1' | 'step2' | 'step3' | 'step4'; }
const monthDays = [['Jan',31],['Feb',28],['Mar',31],['Apr',30],['Mei',31],['Jun',30],['Jul',31],['Agu',31],['Sep',30],['Okt',31],['Nov',30],['Des',31]] as const;

export const MissionToolsDrawer: React.FC<Props> = ({ question, activeStep }) => {
  const [open, setOpen] = useState(false);
  const available = activeStep === 'step3' || (activeStep === 'step4' && question.context === 'agenda');
  if (!available) return null;
  return <aside className="mq-tools">
    <button type="button" className="mq-tools-toggle" onClick={() => setOpen((shown) => !shown)} aria-expanded={open}><Table size={18}/>{open ? 'Tutup alat bantu' : 'Buka alat bantu'}{open ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</button>
    {open && <div className="mq-tools-content"><NeutralMultiplesTable/>{question.startDate && <section className="mq-month-card"><h3>Ingat jumlah hari tiap bulan</h3><div>{monthDays.map(([month, days]) => <span key={month}>{month}<strong>{days}</strong></span>)}</div></section>}</div>}
  </aside>;
};
