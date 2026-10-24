import React, { useEffect, useMemo, useState } from 'react';
import { Volume2, VolumeX, Info } from 'lucide-react';
import type { MissionContext, MissionQuestion, LearningTrack } from '../../types';
import { soundManager } from '../../utils/sound';

interface Props {
  question: MissionQuestion;
  track: LearningTrack;
  missionNumber: number;
}

const contexts: Record<MissionContext, string> = {
  piket: 'Misi jadwal piket',
  lampu: 'Misi lampu lalu lintas',
  olahraga: 'Misi jadwal olahraga',
  agenda: 'Misi agenda sekolah',
};
const dateOrInterval = /(\d+\s*(?:hari|detik)(?:\s+sekali)?|\b\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b)/gi;

function splitStory(story: string): { note: string | null; text: string } {
  const firstLine = story.match(/^\s*\(([^)\r\n]+)\)\s*(?:\r?\n|$)/);
  if (!firstLine) return { note: null, text: story };
  return { note: firstLine[1].trim(), text: story.slice(firstLine[0].length).trimStart() };
}

export const MissionStoryCard: React.FC<Props> = ({ question, track, missionNumber }) => {
  const [canSpeak, setCanSpeak] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const storyParts = useMemo(() => splitStory(question.story), [question.story]);

  useEffect(() => {
    setCanSpeak(typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined');
    setSpeaking(false);
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [missionNumber]);

  const toggleSpeech = () => {
    if (!canSpeak || typeof window === 'undefined' || soundManager.getIsMuted()) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(question.story);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const renderStory = (text: string) => {
    if (track !== 'penjelajah') return text;
    return text.split(dateOrInterval).map((part, index) => /(?:\d+\s*(?:hari|detik)(?:\s+sekali)?|\b\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b)/i.test(part)
      ? <mark key={`${part}-${index}`} className="mq-story-mark">{part}</mark>
      : part);
  };

  return (
    <section className="mq-story" aria-labelledby="mq-story-title">
      <div className="mq-story-heading"><div><span className="mq-section-label">{contexts[question.context]}</span><h2 id="mq-story-title">Baca ceritanya</h2></div>
        {canSpeak && <button type="button" className="mq-speak-button" onClick={toggleSpeech} aria-pressed={speaking} disabled={!speaking && soundManager.getIsMuted()} title={soundManager.getIsMuted() ? 'Nyalakan suara aplikasi untuk mendengarkan' : undefined}>{speaking ? <VolumeX size={18}/> : <Volume2 size={18}/>} {speaking ? 'Hentikan suara' : 'Dengarkan soal'}</button>}
      </div>
      {storyParts.note && <p className="mq-story-note"><Info size={18} aria-hidden="true"/><span><strong>Catatan</strong> {storyParts.note}</span></p>}
      <p className="mq-story-text">{renderStory(storyParts.text)}</p>
    </section>
  );
};
