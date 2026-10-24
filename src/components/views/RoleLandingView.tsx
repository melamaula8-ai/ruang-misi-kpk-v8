import React, { useState } from 'react';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { TikoSays } from '../tiko/TikoSays';
import { SceneBackdrop } from '../tiko/SceneBackdrop';

interface Props { onStudent: () => void; onTeacher: () => void; }

const cheers = ['Siap menjelajah? Tiko ikut, ya!', 'Kita cari pola seru bersama!', 'Setiap langkah bikin kamu makin hebat!'];

export const RoleLandingView: React.FC<Props> = ({ onStudent, onTeacher }) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [tikoLine, setTikoLine] = useState('Halo! Aku Tiko. Ayo cari pola KPK bersamaku!');
  const [cheerIndex, setCheerIndex] = useState(0);
  const speak = (line: string) => setTikoLine(line);

  return (
    <main className="tk-role-page tk-scene-page">
      <SceneBackdrop className="tk-role-backdrop" />
      <div className="tk-role-content">
        <header className="tk-role-heading">
          <span className="tk-sticker">PETUALANGAN MATEMATIKA KELAS V</span>
          <h1>Ayo masuk ke <em>Ruang Misi KPK!</em></h1>
          <p>Pecahkan teka-teki bilangan dan temukan pola bersama timmu.</p>
        </header>

        <div className="tk-role-stage">
          <div className="tk-role-mascot" role="button" tabIndex={0} aria-label="Sapa Tiko" onClick={() => { setTikoLine(cheers[cheerIndex]); setCheerIndex((cheerIndex + 1) % cheers.length); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setTikoLine(cheers[cheerIndex]); setCheerIndex((cheerIndex + 1) % cheers.length); } }}>
            <TikoSays text={tikoLine} size={300} side="right" mood="happy" />
          </div>

          <div className="tk-role-signs" aria-label="Pilih peran">
            <button type="button" className="tk-sign tk-sign-student" onMouseEnter={() => speak('Yuk, belajar materi dan kerjakan misi bersama Tiko!')} onFocus={() => speak('Yuk, belajar materi dan kerjakan misi bersama Tiko!')} onClick={onStudent}>
              <span className="tk-sign-post" aria-hidden="true" />
              <span className="tk-sign-face"><BookOpen aria-hidden="true" /><span><strong>MURID</strong><small>Belajar, berlatih, bertualang</small></span><ArrowRight aria-hidden="true" /></span>
            </button>
            <button type="button" className="tk-sign tk-sign-teacher" onMouseEnter={() => speak('Guru, siapkan sesi dan dampingi kelompok!')} onFocus={() => speak('Guru, siapkan sesi dan dampingi kelompok!')} onClick={onTeacher}>
              <span className="tk-sign-post" aria-hidden="true" />
              <span className="tk-sign-face"><ShieldCheck aria-hidden="true" /><span><strong>GURU</strong><small>Atur kelas dan beri arahan</small></span><ArrowRight aria-hidden="true" /></span>
            </button>
          </div>

          <section className="tk-board tk-chalkboard" aria-label="Tantangan angka">
            <span className="tk-chalk-label">TANTANGAN KAPUR</span>
            <h2>2 × 3 = <b>{selectedNumber ?? '?'}</b></h2>
            <p aria-live="polite">{selectedNumber === null ? 'Pilih jawabanmu!' : selectedNumber === 6 ? 'Tepat! Kamu jeli sekali.' : 'Coba hitung lagi, ya.'}</p>
            <div className="tk-chalk-choices">{[2, 4, 6, 8].map((n) => <button key={n} type="button" aria-label={`Pilih jawaban ${n}`} aria-pressed={selectedNumber === n} onClick={() => setSelectedNumber(n)}>{n}</button>)}</div>
          </section>
        </div>
        <footer className="tk-role-footer"><span>Empat misi investigasi</span><i /> <span>Kerja sama tim</span><i /> <span>Temukan pola KPK</span></footer>
      </div>
    </main>
  );
};
