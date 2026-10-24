import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, Users, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { getTeamIdentityValidationErrors } from '../../utils/teamIdentity';
import { TikoSays } from '../tiko/TikoSays';
import { BookOpen, ClipboardList, Compass, Calculator, Mic2 } from 'lucide-react';

interface Props {
  onNavigate: (view: string, identityValidated?: boolean) => void;
  validationAttempt?: number;
}

const PREDEFINED_ROLES = [
  'Pembaca masalah',
  'Pencatat informasi',
  'Penyusun strategi',
  'Pemeriksa perhitungan',
  'Penyaji hasil',
];
const roleIcons = [BookOpen, ClipboardList, Compass, Calculator, Mic2];

export const TeamIdentityView: React.FC<Props> = ({ onNavigate, validationAttempt = 0 }) => {
  const {
    activeSubmission,
    activeGroupToken,
    updateTeamIdentity,
    clearTeamIdentity,
    currentTrack,
    customLogoUrl,
  } = useAssessment();

  const [formData, setFormData] = useState({
    teamName: activeSubmission.team?.teamName || '',
    schoolName: activeSubmission.team?.schoolName || '',
    members:
      activeSubmission.team?.members && activeSubmission.team.members.length > 0
        ? activeSubmission.team.members.map((m) => ({ ...m }))
        : PREDEFINED_ROLES.map((role) => ({ name: '', role })),
    agreement:
      activeSubmission.team?.agreement ||
      'Kami sepakat saling mendengarkan, bekerja sama secara teliti, dan memeriksa setiap perhitungan.',
  });

  const [savedNotification, setSavedNotification] = useState(false);
  const [clearNotification, setClearNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const validationErrors = showValidation
    ? getTeamIdentityValidationErrors(formData)
    : { teamName: undefined, schoolName: undefined, members: {} as Record<number, string> };

  // Keep form data synchronized when active submission or team data changes
  useEffect(() => {
    if (activeSubmission?.team) {
      setFormData({
        teamName: activeSubmission.team.teamName || '',
        schoolName: activeSubmission.team.schoolName || '',
        members:
          activeSubmission.team.members && activeSubmission.team.members.length > 0
            ? activeSubmission.team.members.map((m) => ({ ...m }))
            : PREDEFINED_ROLES.map((role) => ({ name: '', role })),
        agreement:
          activeSubmission.team.agreement ||
          'Kami sepakat saling mendengarkan, bekerja sama secara teliti, dan memeriksa setiap perhitungan.',
      });
    }
  }, [activeSubmission.id, activeSubmission.team]);

  useEffect(() => {
    if (validationAttempt > 0) setShowValidation(true);
  }, [validationAttempt]);

  const handleMemberNameChange = (index: number, name: string) => {
    const updated = [...formData.members];
    updated[index] = { ...updated[index], name };
    setFormData({ ...formData, members: updated });
    setSavedNotification(false);
    setClearNotification(false);
    setErrorMessage('');
  };

  const handleMemberRoleChange = (index: number, role: string) => {
    const updated = [...formData.members];
    updated[index] = { ...updated[index], role };
    setFormData({ ...formData, members: updated });
    setSavedNotification(false);
    setClearNotification(false);
    setErrorMessage('');
  };

  const handleClearForm = () => {
    const blankTeam = {
      teamName: '',
      schoolName: '',
      members: PREDEFINED_ROLES.map((role) => ({ name: '', role })),
      agreement: 'Kami sepakat saling mendengarkan, bekerja sama secara teliti, dan memeriksa setiap perhitungan.',
    };
    setFormData(blankTeam);
    updateTeamIdentity(blankTeam);
    clearTeamIdentity();
    setSavedNotification(false);
    setClearNotification(true);
    setErrorMessage('');
    setShowValidation(false);
    setTimeout(() => setClearNotification(false), 3000);
  };

  const handleSave = () => {
    setShowValidation(true);
    const errors = getTeamIdentityValidationErrors(formData);
    updateTeamIdentity(formData);
    const isIncomplete = Boolean(
      errors.teamName || errors.schoolName || Object.keys(errors.members).length
    );
    setErrorMessage(
      isIncomplete
        ? 'Identitas tersimpan sementara. Lengkapi kolom yang ditandai sebelum memulai misi.'
        : ''
    );
    setSavedNotification(!isIncomplete);
    setClearNotification(false);
    if (!isIncomplete) setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleStartMissions = () => {
    setShowValidation(true);
    const errors = getTeamIdentityValidationErrors(formData);
    if (
      errors.teamName ||
      errors.schoolName ||
      Object.keys(errors.members).length > 0
    ) {
      setErrorMessage('Lengkapi semua identitas kelompok yang ditandai sebelum memulai misi.');
      return;
    }
    setErrorMessage('');
    updateTeamIdentity(formData);
    onNavigate('pintu', true);
  };

  return (
    <div className="tk-team-page adventure-page w-full max-w-5xl min-w-0 mx-auto px-4 sm:px-6 py-8 space-y-7">
      <section className="tk-team-hero">
        <div><span className="tk-sticker"><Users className="h-4 w-4"/> KARTU ANGGOTA KRU</span><h2>Siapkan timmu</h2><p>Setiap petualang punya peran. Kenalan dulu, lalu berangkat bersama Tiko.</p></div>
        <TikoSays text={errorMessage || (savedNotification ? 'Tim hebat sudah siap! Tiko bangga dengan kalian.' : 'Halo, kru petualang! Ayo bagi tugas dengan adil.') } size={140} side="left" mood={errorMessage ? 'thinking' : savedNotification ? 'proud' : 'happy'} />
      </section>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 border border-[#EAE3D9] shadow-xs flex items-center justify-center shrink-0">
            {customLogoUrl ? (
              <img src={customLogoUrl} alt="Logo Ruang Misi KPK" className="w-full h-full object-contain" />
            ) : (
              <div aria-label="Logo Ruang Misi KPK" className="flex h-full w-full items-center justify-center rounded-xl bg-[#3E2723] text-sm font-black tracking-tight text-[#FFE082]">KPK</div>
            )}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[#95634F]">
              Kolaborasi Tim
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E2723] tracking-tight break-words">
              Identitas Tim & Kesepakatan Belajar
            </h1>
            <p className="text-xs sm:text-sm text-[#6D5A50] mt-0.5">
              Bekerja sama dalam kelompok untuk menyelidiki dan menyelesaikan 4 misi matematika.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8C7A70]">ID Kelompok:</span>
            <span className="font-mono text-xs font-extrabold uppercase px-3 py-1 rounded-lg bg-[#FFE082]/60 text-[#6F4736] border border-[#FFE082] shadow-2xs">
              {activeGroupToken?.code || activeSubmission.groupCode || 'Belum Terhubung'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8C7A70]">Pintu:</span>
            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded bg-[#C5E68A]/30 text-[#4A671E] border border-[#C5E68A]">
              {currentTrack}
            </span>
          </div>
        </div>
      </div>

      {errorMessage && <div className="tk-team-validation" role="alert"><AlertCircle className="w-5 h-5 shrink-0" /><TikoSays text={errorMessage} size={76} side="left" mood="thinking" /></div>}

      {savedNotification && (
        <div className="flex items-center gap-2 p-3 bg-[#C5E68A]/30 border border-[#A8D468] text-[#2D231E] text-xs rounded-xl font-bold">
          <CheckCircle2 className="w-4 h-4 text-[#4A671E] shrink-0" />
          <span>Identitas tim berhasil disimpan!</span>
        </div>
      )}

      {clearNotification && (
        <div className="flex items-center gap-2 p-3 bg-neutral-100 border border-neutral-300 text-[#3E2723] text-xs rounded-xl font-bold">
          <RotateCcw className="w-4 h-4 text-[#95634F] shrink-0" />
          <span>Kolom nama kelompok dan anggota telah dikosongkan. Siap diisi oleh murid.</span>
        </div>
      )}

      {/* Main Form */}
      <div className="w-full min-w-0 bg-white border border-[#EAE3D9] rounded-2xl p-4 sm:p-8 space-y-6 shadow-xs">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-4">
          <div className="tk-team-field space-y-1.5">
            <label htmlFor="team-name" className="tk-label-sticker text-xs font-bold text-[#3E2723] block">
              Nama Kelompok <span className="text-red-500">*</span>
            </label>
            <input
              id="team-name"
              type="text"
              autoComplete="off"
              required
              value={formData.teamName}
              onChange={(e) => {
                setFormData({ ...formData, teamName: e.target.value });
                setSavedNotification(false);
                setErrorMessage('');
              }}
              placeholder="Tuliskan nama kelompok di sini..."
              aria-invalid={Boolean(validationErrors.teamName)}
              aria-describedby={validationErrors.teamName ? 'team-name-error' : undefined}
              className={`box-border h-14 w-full min-w-0 px-4 bg-[#FAF8F5] border rounded-xl text-sm lg:text-base font-medium text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#FF913D] ${
                validationErrors.teamName ? 'border-red-400' : 'border-[#D8CFC8]'
              }`}
            />
            {validationErrors.teamName && (
              <p id="team-name-error" role="alert" className="text-xs font-medium text-red-700">
                {validationErrors.teamName}
              </p>
            )}
          </div>

          <div className="tk-team-field space-y-1.5">
            <label htmlFor="school-name" className="tk-label-sticker text-xs font-bold text-[#3E2723] block">
              Nama Sekolah <span className="text-red-500">*</span>
            </label>
            <input
              id="school-name"
              type="text"
              autoComplete="off"
              required
              value={formData.schoolName}
              onChange={(e) => {
                setFormData({ ...formData, schoolName: e.target.value });
                setSavedNotification(false);
                setErrorMessage('');
              }}
              placeholder="Tuliskan nama sekolah di sini..."
              aria-invalid={Boolean(validationErrors.schoolName)}
              aria-describedby={validationErrors.schoolName ? 'school-name-error' : undefined}
              className={`box-border h-14 w-full min-w-0 px-4 bg-[#FAF8F5] border rounded-xl text-sm lg:text-base font-medium text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#FF913D] ${
                validationErrors.schoolName ? 'border-red-400' : 'border-[#D8CFC8]'
              }`}
            />
            {validationErrors.schoolName && (
              <p id="school-name-error" role="alert" className="text-xs font-medium text-red-700">
                {validationErrors.schoolName}
              </p>
            )}
          </div>
        </div>

        {/* Member Roles */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-[#3E2723] block">
                Daftar Anggota & Pembagian Peran <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-[#8C7A70]">
                Isi nama setiap anggota yang dipilih. Peran boleh dirangkap jika anggota kurang dari 5 orang.
              </span>
            </div>

            <div className="tk-count-chairs flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#6D5A50] px-2">Jumlah:</span>
              {[3, 4, 5].map((cnt) => (
                <button
                  type="button"
                  key={cnt}
                  onClick={() => {
                    const current = [...formData.members];
                    if (cnt > current.length) {
                      while (current.length < cnt) {
                        const idx = current.length;
                        current.push({ name: '', role: PREDEFINED_ROLES[idx] || PREDEFINED_ROLES[0] });
                      }
                    } else if (cnt < current.length) {
                      current.splice(cnt);
                    }
                    setFormData({ ...formData, members: current });
                  }}
                  aria-pressed={formData.members.length === cnt}
                  className={`tk-chair px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formData.members.length === cnt
                      ? 'bg-[#FF913D] text-white shadow-xs'
                      : 'text-[#6D5A50] hover:text-[#3E2723] hover:bg-white'
                  }`}
                >
                  {cnt} Orang
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {formData.members.map((member, idx) => (
              <div
                key={idx}
                className="tk-crew-ticket member-role-card grid grid-cols-1 gap-3"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="tk-crew-heading"><span className={`tk-member-avatar tk-avatar-${idx % 5}`}>{member.name.trim().charAt(0).toUpperCase() || idx + 1}</span><strong>Kartu Kru {idx + 1}</strong></div>
                  <label htmlFor={`member-name-${idx}`} className="tk-label-sticker block text-xs font-bold text-[#3E2723]">
                    Anggota {idx + 1} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`member-name-${idx}`}
                    type="text"
                    autoComplete="off"
                    required
                    value={member.name}
                    onChange={(e) => handleMemberNameChange(idx, e.target.value)}
                    placeholder={`Nama Anggota ${idx + 1}...`}
                    aria-invalid={Boolean(validationErrors.members[idx])}
                    aria-describedby={validationErrors.members[idx] ? `member-name-${idx}-error` : undefined}
                    className={`box-border h-14 w-full min-w-0 px-4 bg-white border rounded-lg text-sm lg:text-base font-medium text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#FF913D] ${
                      validationErrors.members[idx] ? 'border-red-400' : 'border-[#D8CFC8]'
                    }`}
                  />
                  {validationErrors.members[idx] && (
                    <p id={`member-name-${idx}-error`} role="alert" className="text-xs font-medium text-red-700">
                      {validationErrors.members[idx]}
                    </p>
                  )}
                </div>
                <div className="min-w-0 space-y-1.5">
                  <span className="tk-label-sticker block text-xs font-bold text-[#3E2723]">
                    Peran Anggota {idx + 1}
                  </span>
                  <div id={`member-role-${idx}`} className="tk-role-chips" role="radiogroup" aria-label={`Pilih peran anggota ${idx + 1}`}>
                    {PREDEFINED_ROLES.map((role, roleIndex) => {
                      const RoleIcon = roleIcons[roleIndex];
                      return <button key={role} type="button" role="radio" aria-checked={member.role === role} tabIndex={member.role === role ? 0 : -1} className="tk-role-chip" onClick={() => handleMemberRoleChange(idx, role)} onKeyDown={(event) => {
                        const choices = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]') || []);
                        const offset = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
                        if (offset) { event.preventDefault(); const nextIndex = (roleIndex + offset + choices.length) % choices.length; handleMemberRoleChange(idx, PREDEFINED_ROLES[nextIndex]); choices[nextIndex]?.focus(); }
                      }}><RoleIcon size={16} aria-hidden="true" />{role}</button>;
                    })}
                  </div>
                </div>
              </div>
            ))}
            {validationErrors.members[-1] && (
              <p role="alert" className="text-xs font-medium text-red-700">
                {validationErrors.members[-1]}
              </p>
            )}
          </div>
        </div>

        {/* Team Agreement */}
        <div className="tk-agreement-section space-y-1.5 pt-2">
          <label className="text-xs font-bold text-[#3E2723] block">
            Kesepakatan Kerja Kelompok
          </label>
          <textarea
            id="team-agreement"
            autoComplete="off"
            value={formData.agreement}
            onChange={(e) => {
              setFormData({ ...formData, agreement: e.target.value });
              setSavedNotification(false);
              setErrorMessage('');
            }}
            placeholder="Tuliskan komitmen kelompokmu..."
            className="tk-lined-paper box-border h-40 min-h-[140px] max-h-[180px] w-full min-w-0 resize-y px-4 py-3 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl text-base font-medium text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#FF913D]"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('pintu')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#EAE3D9] text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pintu Misi</span>
        </button>

        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleClearForm}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-red-50 text-[#8C7A70] hover:text-red-700 border border-[#D8CFC8] hover:border-red-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Kosongkan nama kelompok dan seluruh nama anggota"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kosongkan Form</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#D8CFC8] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#95634F]" />
            <span>Simpan Identitas</span>
          </button>

          <button
            type="button"
            onClick={handleStartMissions}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Mulai Misi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
