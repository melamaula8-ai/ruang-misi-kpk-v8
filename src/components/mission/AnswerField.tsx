import React from 'react';
import { Info } from 'lucide-react';
import type { LearningTrack, PolyaField } from '../../types';
import type { MissionStep } from './PolyaStepper';

interface Props { field: PolyaField; value: string; step: MissionStep; inputId: string; disabled: boolean; track: LearningTrack; onChange: (step: MissionStep, fieldId: string, value: string) => void; }
const starters = ['Pertama, kami…', 'Karena…', 'Jadi…'];

export const AnswerField: React.FC<Props> = ({ field, value, step, inputId, disabled, track, onChange }) => {
  const labelParts = field.label.split('...');
  const isInline = field.type !== 'textarea' && labelParts.length > 1;
  const tail = isInline ? labelParts.slice(1).join('...') : '';
  const suffix = field.scaffoldSuffix;
  const suffixAlreadyShown = Boolean(suffix && tail.trimStart().toLocaleLowerCase('id').startsWith(suffix.toLocaleLowerCase('id')));
  const placeholder = field.placeholder || 'Tuliskan jawabanmu di sini…';
  const change = (next: string) => onChange(step, field.id, next);
  const insertStarter = (starter: string) => {
    if (!value || /[\s\n]$/.test(value)) change(`${value}${starter} `);
  };

  const sharedInputClass = 'mq-answer-input';
  const input = field.type === 'textarea' ? (
    <textarea id={inputId} rows={5} autoComplete="off" value={value} disabled={disabled} onChange={(event) => change(event.target.value)} placeholder={placeholder} className="mq-answer-textarea" />
  ) : (
    <span className="mq-input-with-suffix">
      {field.scaffoldPrefix && <span className="mq-scaffold-prefix">{field.scaffoldPrefix}</span>}
      <input id={inputId} type="text" inputMode={field.type === 'number' ? 'numeric' : undefined} autoComplete="off" value={value} disabled={disabled} onChange={(event) => change(event.target.value)} placeholder={isInline ? '…' : placeholder} className={sharedInputClass}/>
      {suffix && !suffixAlreadyShown && <span className="mq-scaffold-suffix">{suffix}</span>}
    </span>
  );

  const numericPreviews = field.id.toLowerCase().includes('multiples') && field.type === 'text'
    ? Array.from(value.matchAll(/\d+/g), (match) => match[0])
    : [];

  return <div className={`mq-field${isInline ? ' mq-field-inline' : ''}`}>
    {isInline ? <label htmlFor={inputId} className="mq-inline-sentence"><span>{labelParts[0]}</span>{input}<span>{tail}</span></label>
      : <><label htmlFor={inputId} className="mq-field-label">{field.label}</label>{input}</>}
    {field.helperText && <p className="mq-helper"><Info size={16} aria-hidden="true"/>{field.helperText}</p>}
    {numericPreviews.length > 0 && <div className="mq-multiples-preview" aria-label="Pratinjau angka yang kamu tulis">{numericPreviews.map((number, index) => <span key={`${number}-${index}`}>{number}</span>)}</div>}
    {field.type === 'textarea' && track !== 'inovator' && <div className="mq-starters" aria-label="Contoh pembuka kalimat">{starters.map((starter) => <button key={starter} type="button" disabled={disabled || Boolean(value && !/[\s\n]$/.test(value))} onClick={() => insertStarter(starter)}>{starter}</button>)}</div>}
  </div>;
};
