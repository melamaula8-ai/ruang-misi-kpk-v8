import React from 'react';
import { Check, ClipboardList, Search, Calculator, BadgeCheck } from 'lucide-react';
import type { MissionSubmissionAnswers } from '../../types';

export type MissionStep = 'step1' | 'step2' | 'step3' | 'step4';
interface Props { activeStep: MissionStep; answers: MissionSubmissionAnswers; onStepChange: (step: MissionStep) => void; }
const items: { id: MissionStep; short: string; long: string; Icon: typeof Search }[] = [
  { id: 'step1', short: 'Pahami', long: 'Memahami masalah', Icon: Search },
  { id: 'step2', short: 'Rencana', long: 'Menyusun rencana', Icon: ClipboardList },
  { id: 'step3', short: 'Hitung', long: 'Melaksanakan rencana', Icon: Calculator },
  { id: 'step4', short: 'Periksa', long: 'Memeriksa kembali', Icon: BadgeCheck },
];

export const PolyaStepper: React.FC<Props> = ({ activeStep, answers, onStepChange }) => (
  <nav className="mq-stepper" aria-label="Empat tahap Polya">
    {items.map(({ id, short, long, Icon }, index) => {
      const filled = Object.values(answers[id] || {}).some((value) => Boolean(value?.trim()));
      const active = id === activeStep;
      return <React.Fragment key={id}>
        <button type="button" className={`mq-stepper-item${active ? ' is-active' : ''}${!active && filled ? ' is-filled' : ''}`} onClick={() => onStepChange(id)} aria-current={active ? 'step' : undefined} aria-label={`Tahap ${index + 1}: ${long}`} title={long}>
          <span className="mq-stepper-circle">{filled && !active ? <Check size={19} aria-hidden="true"/> : <Icon size={18} aria-hidden="true"/>}</span><span>{short}</span>
        </button>
        {index < items.length - 1 && <span className={`mq-stepper-link${filled ? ' is-filled' : ''}`} aria-hidden="true"/>}
      </React.Fragment>;
    })}
  </nav>
);
