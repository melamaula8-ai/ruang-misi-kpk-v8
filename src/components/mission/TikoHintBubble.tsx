import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import type { MissionQuestion } from '../../types';

interface Props {
  question: MissionQuestion;
  activeStep: 'step1' | 'step2' | 'step3' | 'step4';
  missionNumber: number;
  teacherHint: string;
  onRequestHint: () => void;
}

export const TikoHintBubble: React.FC<Props> = ({ question, activeStep, missionNumber, teacherHint, onRequestHint }) => {
  const [hintIndex, setHintIndex] = useState(-1);
  const [showTeacherHint, setShowTeacherHint] = useState(false);
  const hints = question.didacticHints[activeStep] || [];

  useEffect(() => {
    setHintIndex(-1);
    setShowTeacherHint(false);
  }, [activeStep, missionNumber]);

  const advanceHint = () => {
    onRequestHint();
    setHintIndex((previous) => previous < 0 ? 0 : (previous + 1) % Math.max(hints.length, 1));
  };

  return (
    <aside className="mq-tiko-panel">
      <div className="mq-tiko-bubble">
        <img src="/assets/elephant.png" alt="" aria-hidden="true"/>
        <div className="mq-tiko-copy"><span>Tiko punya ide</span>{hintIndex >= 0 && hints[hintIndex] ? <p aria-live="polite">{hints[hintIndex]}</p> : <p>Kalau bingung, kita pikirkan pelan-pelan bersama.</p>}</div>
        <button type="button" className="mq-hint-button" onClick={advanceHint} disabled={!hints.length}><Lightbulb size={18}/>{hintIndex < 0 ? 'Minta petunjuk Tiko' : 'Petunjuk berikutnya'}</button>
      </div>
      {hintIndex >= 0 && hints.length > 0 && <span className="mq-hint-count" aria-live="polite">Petunjuk {hintIndex + 1} dari {hints.length}</span>}
      <div className="mq-teacher-hint">
        <button type="button" onClick={() => setShowTeacherHint((shown) => !shown)} aria-expanded={showTeacherHint}>{showTeacherHint ? <ChevronUp size={17}/> : <ChevronDown size={17}/>} Petunjuk guru</button>
        {showTeacherHint && <p>{teacherHint}</p>}
      </div>
    </aside>
  );
};
