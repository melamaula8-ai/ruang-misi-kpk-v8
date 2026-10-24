import { useEffect, useState } from "react";

/**
 * GajahMisiBerhasil
 * Animasi gajah kartun 2D (SVG + CSS keyframes) untuk Ruang Misi KPK.
 * - Dimainkan SEKALI (±3 detik) saat komponen di-mount.
 * - Background transparan, tanpa library, tanpa API.
 * - CSS di-scope dengan prefix "rm-" agar tidak mengubah desain lain.
 * - Untuk memutar ulang, ubah prop `key` dari luar: <GajahMisiBerhasil key={n} />
 * - Menghormati prefers-reduced-motion (langsung tampil pose akhir + teks).
 */

const TOTAL_MS = 3100;

const CONFETTI_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF9CEE", "#FF9F45"];

// Posisi konfeti deterministik (tanpa Math.random, aman untuk SSR)
const CONFETTI = Array.from({ length: 22 }, (_, i) => {
  const r = (n) => {
    const x = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    x: 15 + r(1) * 270,
    dx: (r(2) - 0.5) * 50,
    rot: (r(3) > 0.5 ? 1 : -1) * (240 + r(4) * 360),
    delay: 0.9 + r(5) * 0.7,
    dur: 1.0 + r(6) * 0.4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: i % 4 === 0,
  };
});

const STARS = [
  { x: 42, y: 72, s: 1.1, d: 1.0 },
  { x: 262, y: 62, s: 1.3, d: 1.2 },
  { x: 30, y: 170, s: 0.8, d: 1.4 },
  { x: 272, y: 168, s: 0.9, d: 1.5 },
  { x: 92, y: 10, s: 0.8, d: 1.6, keep: true },
  { x: 214, y: 8, s: 1.0, d: 1.7, keep: true },
];

const BODY = "#8FB8DE";
const DARK = "#6E9CC9";
const BELLY = "#BFDDF3";
const TRUNK = "#7CA9D6";
const PINK = "#F6B5C8";
const INK = "#2B3A55";

const CSS = `
.rm-gajah{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%}
.rm-gajah svg{width:min(100%,var(--rm-size,320px));height:auto;overflow:visible;display:block}
.rm-gajah svg *{transform-box:view-box}

/* satu timeline 3 detik untuk semua bagian tubuh */
.rm-a{animation-duration:3s;animation-iteration-count:1;animation-fill-mode:both;animation-timing-function:ease-in-out}

.rm-shadow{transform-origin:150px 266px;animation-name:rm-shadow}
.rm-main{transform-origin:150px 262px;animation-name:rm-main}
.rm-wobble{transform-origin:150px 262px;animation-name:rm-wobble}
.rm-tail{transform-origin:84px 184px;animation-name:rm-tail}
.rm-leg{animation-name:rm-leg}
.rm-head{transform-origin:150px 170px;animation-name:rm-head}
.rm-ear{--d:rotate(calc(var(--s) * -6deg)) scale(1,1);--u:rotate(calc(var(--s) * 24deg)) scale(.82,1);animation-name:rm-ear}
.rm-trunk{animation-name:rm-trunk}
.rm-eyes{transform-origin:150px 106px;animation-name:rm-blink}
.rm-happy{opacity:0;animation-name:rm-happy}
.rm-mouth{transform-origin:150px 146px;animation-name:rm-mouth}

@keyframes rm-shadow{
  0%{transform:scale(.3,1);opacity:0}
  8%{transform:scale(1.05,1);opacity:1}
  16%,28%{transform:scale(1,1);opacity:1}
  39%{transform:scale(.6,1)}
  50%{transform:scale(1.08,1)}
  58%,80%{transform:scale(1,1)}
  100%{transform:scale(1.04,1);opacity:1}
}
@keyframes rm-main{
  0%{transform:translateY(-120px) scale(.3,.3);opacity:0;animation-timing-function:ease-in}
  6%{transform:translateY(0) scale(1.12,.82);opacity:1;animation-timing-function:ease-out}
  11%{transform:translateY(-28px) scale(.94,1.08);animation-timing-function:ease-in}
  16%{transform:translateY(0) scale(1.06,.92);animation-timing-function:ease-out}
  20%{transform:translateY(0) scale(1,1)}
  25%{transform:translateY(0) scale(1.07,.84)}
  28%{transform:translateY(0) scale(1.1,.78)}
  32%{transform:translateY(-14px) scale(.92,1.12);animation-timing-function:ease-out}
  39%{transform:translateY(-78px) scale(.97,1.04);animation-timing-function:ease-in}
  47%{transform:translateY(-10px) scale(.98,1.05)}
  50%{transform:translateY(0) scale(1.1,.82)}
  54%{transform:translateY(0) scale(.97,1.04)}
  58%,80%{transform:translateY(0) scale(1,1)}
  86%{transform:translateY(-6px) scale(1.05,1.05)}
  100%{transform:translateY(-4px) scale(1.04,1.04);opacity:1}
}
@keyframes rm-wobble{
  0%,58%{transform:rotate(0deg)}
  62%{transform:rotate(-4deg)}
  67%{transform:rotate(4deg)}
  72%{transform:rotate(-3deg)}
  77%{transform:rotate(2deg)}
  82%,100%{transform:rotate(0deg)}
}
@keyframes rm-tail{
  0%{transform:rotate(0deg)}
  8%{transform:rotate(-18deg)}
  16%{transform:rotate(14deg)}
  24%{transform:rotate(-10deg)}
  32%{transform:rotate(0deg)}
  40%{transform:rotate(-20deg)}
  48%{transform:rotate(16deg)}
  56%{transform:rotate(-12deg)}
  64%{transform:rotate(16deg)}
  72%{transform:rotate(-16deg)}
  80%{transform:rotate(12deg)}
  88%{transform:rotate(-14deg)}
  100%{transform:rotate(0deg)}
}
/* kaki menekuk saat jongkok, terlipat saat di udara, lalu meredam saat mendarat */
@keyframes rm-leg{
  0%,24%{transform:rotate(0deg) scale(1,1)}
  28%{transform:rotate(calc(var(--s) * 8deg)) scale(1,.82)}
  34%{transform:rotate(calc(var(--s) * 4deg)) scale(1,1.05)}
  38%,44%{transform:rotate(calc(var(--s) * 16deg)) scale(1,.86)}
  50%{transform:rotate(calc(var(--s) * 6deg)) scale(1,.88)}
  58%,100%{transform:rotate(0deg) scale(1,1)}
}
@keyframes rm-head{
  0%,25%{transform:translateY(0) rotate(0deg)}
  28%{transform:translateY(5px) rotate(-3deg)}
  32%{transform:translateY(-4px) rotate(-6deg)}
  39%{transform:translateY(-6px) rotate(6deg)}
  44%{transform:translateY(0) rotate(-4deg)}
  50%{transform:translateY(6px) rotate(0deg)}
  54%{transform:translateY(-3px) rotate(4deg)}
  58%{transform:translateY(0) rotate(-3deg)}
  64%{transform:translateY(0) rotate(5deg)}
  70%{transform:translateY(0) rotate(-5deg)}
  76%{transform:translateY(0) rotate(4deg)}
  82%{transform:translateY(0) rotate(0deg)}
  88%,100%{transform:translateY(-3px) rotate(-7deg)}
}
@keyframes rm-ear{
  0%{transform:rotate(0deg) scale(1,1)}
  6%{transform:rotate(calc(var(--s) * 10deg)) scale(.95,1)}
  11%{transform:rotate(calc(var(--s) * -4deg)) scale(1,1)}
  16%,30%{transform:rotate(0deg) scale(1,1)}
  32%,40%,48%,56%,64%,72%{transform:var(--d)}
  36%,44%,52%,60%,68%,76%{transform:var(--u)}
  82%{transform:rotate(0deg) scale(1,1)}
  90%,100%{transform:rotate(calc(var(--s) * 14deg)) scale(.92,1)}
}
/* belalai: tiga ruas bergerak berurutan seperti cambuk */
@keyframes rm-trunk{
  0%{transform:rotate(0deg)}
  6%{transform:rotate(calc(var(--m) * 8deg))}
  11%{transform:rotate(calc(var(--m) * -6deg))}
  16%{transform:rotate(calc(var(--m) * 3deg))}
  20%,26%{transform:rotate(0deg)}
  28%{transform:rotate(calc(var(--m) * 12deg))}
  36%{transform:rotate(calc(var(--m) * -62deg))}
  42%{transform:rotate(calc(var(--m) * -48deg))}
  48%{transform:rotate(calc(var(--m) * -66deg))}
  54%{transform:rotate(calc(var(--m) * -50deg))}
  60%{transform:rotate(calc(var(--m) * -66deg))}
  66%{transform:rotate(calc(var(--m) * -48deg))}
  72%{transform:rotate(calc(var(--m) * -66deg))}
  78%{transform:rotate(calc(var(--m) * -52deg))}
  86%{transform:rotate(calc(var(--m) * -70deg))}
  100%{transform:rotate(calc(var(--m) * -62deg))}
}
/* kedip tiga kali, lalu mata berubah jadi lengkung bahagia di pose kemenangan */
@keyframes rm-blink{
  0%,55%{transform:scale(1,1);opacity:1}
  56.5%{transform:scale(1,.1)}
  58%,66%{transform:scale(1,1)}
  67.5%{transform:scale(1,.1)}
  69%,75%{transform:scale(1,1)}
  76.5%{transform:scale(1,.1)}
  78%,82%{transform:scale(1,1);opacity:1}
  84%,100%{transform:scale(1,1);opacity:0}
}
@keyframes rm-happy{
  0%,82%{opacity:0}
  84%,100%{opacity:1}
}
@keyframes rm-mouth{
  0%,30%{transform:scale(1,1)}
  34%,46%{transform:scale(1.1,1.2)}
  52%,100%{transform:scale(1.05,1.08)}
}

/* bintang berkilau */
.rm-star{opacity:0;transform-box:fill-box!important;transform-origin:center;animation:rm-twinkle .6s ease-in-out 2 both}
.rm-star.keep{animation:rm-twinkle-keep .8s ease-out 1 both}
@keyframes rm-twinkle{
  0%{opacity:0;transform:scale(0) rotate(0deg)}
  50%{opacity:1;transform:scale(1.2) rotate(45deg)}
  100%{opacity:0;transform:scale(0) rotate(90deg)}
}
@keyframes rm-twinkle-keep{
  0%{opacity:0;transform:scale(0) rotate(0deg)}
  60%{opacity:1;transform:scale(1.3) rotate(60deg)}
  100%{opacity:1;transform:scale(1) rotate(90deg)}
}

/* konfeti berjatuhan */
.rm-conf{opacity:0;transform-box:fill-box!important;transform-origin:center;animation:rm-fall 1.2s linear 1 both}
@keyframes rm-fall{
  0%{opacity:0;transform:translate(var(--x),-14px) rotate(0deg)}
  8%{opacity:1}
  50%{transform:translate(calc(var(--x) + var(--dx) * .3 + 12px),140px) rotate(calc(var(--r) * .5))}
  90%{opacity:1}
  100%{opacity:0;transform:translate(calc(var(--x) + var(--dx)),290px) rotate(var(--r))}
}

/* teks */
.rm-text{margin:0;min-height:3.4em;text-align:center;font-family:'Baloo 2','Nunito','Trebuchet MS',system-ui,sans-serif;font-size:clamp(1.05rem,4.2vw,1.45rem);line-height:1.35;color:var(--rm-text-color,#1F3A5F);max-width:22em}
.rm-text strong{display:block;font-size:1.25em;color:var(--rm-accent,#E53935)}
.rm-text-in{display:inline-block;animation:rm-pop .5s cubic-bezier(.34,1.56,.64,1) both}
@keyframes rm-pop{
  from{opacity:0;transform:translateY(10px) scale(.9)}
  to{opacity:1;transform:translateY(0) scale(1)}
}

@media (prefers-reduced-motion: reduce){
  .rm-gajah svg *{animation:none!important}
  .rm-text-in{animation:none}
}
`;

function Leg({ x, w = 32, s, color }) {
  const y = 222;
  const h = 40;
  return (
    <g className="rm-leg rm-a" style={{ "--s": s, transformOrigin: `${x + w / 2}px ${y + 4}px` }}>
      <rect x={x} y={y} width={w} height={h} rx="14" fill={color} stroke={DARK} strokeWidth="3" />
      {[7, 16, 25].map((dx) => (
        <circle key={dx} cx={x + dx} cy={y + h - 6} r="3.2" fill="#F5F9FD" />
      ))}
    </g>
  );
}

function Ear({ cx, s, ox }) {
  return (
    <g className="rm-ear rm-a" style={{ "--s": s, transformOrigin: `${ox}px 108px` }}>
      <ellipse cx={cx} cy="112" rx="34" ry="40" fill={BODY} stroke={DARK} strokeWidth="3" />
      <ellipse cx={cx + (s === 1 ? 2 : -2)} cy="114" rx="19" ry="26" fill={PINK} />
    </g>
  );
}

export default function GajahMisiBerhasil({ size = 320, onComplete }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(
      () => {
        setDone(true);
        if (onComplete) onComplete();
      },
      reduce ? 0 : TOTAL_MS
    );
    return () => clearTimeout(t);
    // sengaja hanya sekali saat mount: animasi dimainkan satu kali
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rm-gajah" style={{ "--rm-size": `${size}px` }}>
      <style>{CSS}</style>

      <svg
        viewBox="0 -20 300 320"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Tiko melompat gembira merayakan misi selesai"
      >
        <ellipse className="rm-shadow rm-a" cx="150" cy="266" rx="68" ry="8" fill="#000" fillOpacity=".15" />

        <g className="rm-main rm-a">
          <g className="rm-wobble rm-a">
            {/* ekor */}
            <g className="rm-tail rm-a">
              <path d="M82 182 C66 182 58 194 62 210" fill="none" stroke={DARK} strokeWidth="6" strokeLinecap="round" />
              <ellipse cx="62" cy="213" rx="5" ry="8" fill={DARK} />
            </g>

            {/* kaki belakang */}
            <Leg x={88} s={1} color={DARK} />
            <Leg x={180} s={-1} color={DARK} />

            {/* badan */}
            <ellipse cx="150" cy="190" rx="72" ry="58" fill={BODY} stroke={DARK} strokeWidth="3" />
            <ellipse cx="150" cy="204" rx="44" ry="30" fill={BELLY} />

            {/* kaki depan */}
            <Leg x={114} s={1} color={BODY} />
            <Leg x={154} s={-1} color={BODY} />

            {/* kepala */}
            <g className="rm-head rm-a">
              <Ear cx={98} s={1} ox={112} />
              <Ear cx={202} s={-1} ox={188} />

              <circle cx="150" cy="116" r="50" fill={BODY} stroke={DARK} strokeWidth="3" />

              {/* pita merah kecil */}
              <path d="M170 70 L154 60 L154 80Z M170 70 L186 60 L186 80Z" fill="#E53935" />
              <circle cx="170" cy="70" r="4.5" fill="#C62828" />

              {/* pipi */}
              <circle cx="116" cy="128" r="8" fill="#FF9EB5" fillOpacity=".55" />
              <circle cx="184" cy="128" r="8" fill="#FF9EB5" fillOpacity=".55" />

              {/* mulut tersenyum */}
              <g className="rm-mouth rm-a">
                <path d="M124 144 Q150 172 176 144" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
              </g>

              {/* mata terbuka (berkedip) */}
              <g className="rm-eyes rm-a">
                {[131, 169].map((ex) => (
                  <g key={ex}>
                    <circle cx={ex} cy="106" r="9.5" fill="#fff" stroke={INK} strokeWidth="1.5" />
                    <circle cx={ex} cy="107" r="5.5" fill={INK} />
                    <circle cx={ex + 2} cy="104.5" r="2" fill="#fff" />
                  </g>
                ))}
              </g>
              {/* mata bahagia untuk pose kemenangan */}
              <g className="rm-happy rm-a" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round">
                <path d="M121 109 Q131 95 141 109" />
                <path d="M159 109 Q169 95 179 109" />
              </g>

              {/* belalai: tiga ruas bersarang */}
              <g
                className="rm-trunk rm-a"
                style={{ "--m": 1, transformOrigin: "150px 130px", animationDelay: "0s" }}
              >
                <line x1="150" y1="130" x2="150" y2="156" stroke={TRUNK} strokeWidth="28" strokeLinecap="round" />
                <path d="M139 143 Q150 147 161 143" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
                <g
                  className="rm-trunk rm-a"
                  style={{ "--m": 1, transformOrigin: "150px 156px", animationDelay: ".05s" }}
                >
                  <line x1="150" y1="156" x2="150" y2="180" stroke={TRUNK} strokeWidth="24" strokeLinecap="round" />
                  <path d="M141 168 Q150 171 159 168" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
                  <g
                    className="rm-trunk rm-a"
                    style={{ "--m": 1.08, transformOrigin: "150px 180px", animationDelay: ".1s" }}
                  >
                    <line x1="150" y1="180" x2="150" y2="200" stroke={TRUNK} strokeWidth="20" strokeLinecap="round" />
                    <path d="M144 190 Q150 193 156 190" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
                    <ellipse cx="150" cy="207" rx="4" ry="2.5" fill={DARK} />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>

        {/* bintang berkilau */}
        {STARS.map((st, i) => (
          <g key={i} transform={`translate(${st.x} ${st.y}) scale(${st.s})`}>
            <g className={`rm-star${st.keep ? " keep" : ""}`} style={{ animationDelay: `${st.d}s` }}>
              <path
                d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12Z"
                fill="#FFD84D"
                stroke="#F5A623"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </g>
          </g>
        ))}

        {/* konfeti */}
        {CONFETTI.map((c, i) => (
          <rect
            key={i}
            className="rm-conf"
            width="7"
            height={c.round ? 7 : 11}
            rx={c.round ? 3.5 : 1.5}
            fill={c.color}
            style={{
              "--x": `${c.x}px`,
              "--dx": `${c.dx}px`,
              "--r": `${c.rot}deg`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
            }}
          />
        ))}
      </svg>

      <p className="rm-text" role="status" aria-live="polite">
        {done && (
          <span className="rm-text-in">
            <strong>Misi Berhasil!</strong> Hebat, kamu berhasil!
          </span>
        )}
      </p>
    </div>
  );
}
