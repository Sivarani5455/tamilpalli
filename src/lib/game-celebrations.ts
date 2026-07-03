"use client";

type CelebrationTone = "correct" | "wrong";
type CelebrationLocale = "en" | "fr" | "ta";

type CelebrationCopy = {
  correctTitle: string;
  correctSubtitle: string;
  wrongTitle: string;
  wrongSubtitle: string;
  wrongSoftTitle: string;
  wrongSoftSubtitle: string;
  wrongAgainTitle: string;
  wrongAgainSubtitle: string;
};

const OVERLAY_DURATION_MS = 1550;
const FADE_MS = 180;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function getCelebrationCopy(locale: CelebrationLocale): CelebrationCopy {
  if (locale === "ta") {
    return {
      correctTitle: "அருமை !",
      correctSubtitle: "நீ கண்டுபிடித்தாய்",
      wrongTitle: "கிட்டத்தட்ட",
      wrongSubtitle: "மீண்டும் முயற்சி செய்",
      wrongSoftTitle: "இன்னும் கொஞ்சம்",
      wrongSoftSubtitle: "நன்றாக பார்",
      wrongAgainTitle: "தொடர்ந்து செய்",
      wrongAgainSubtitle: "நீ அருகில் இருக்கிறாய்",
    };
  }

  if (locale === "en") {
    return {
      correctTitle: "Super !",
      correctSubtitle: "You found it",
      wrongTitle: "Almost",
      wrongSubtitle: "Try again",
      wrongSoftTitle: "Not quite",
      wrongSoftSubtitle: "Look closely",
      wrongAgainTitle: "Keep going",
      wrongAgainSubtitle: "You are close",
    };
  }

  return {
    correctTitle: "Super !",
    correctSubtitle: "Tu as trouvé",
    wrongTitle: "Presque",
    wrongSubtitle: "Essaie encore",
    wrongSoftTitle: "Pas tout à fait",
    wrongSoftSubtitle: "Regarde bien",
    wrongAgainTitle: "Encore",
    wrongAgainSubtitle: "Tu y es presque",
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ensureCelebrationStyles() {
  if (document.getElementById("game-celebration-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "game-celebration-styles";
  style.textContent = `
    .game-celebration-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: grid;
      place-items: center;
      pointer-events: none;
      opacity: 0;
      transition: opacity ${FADE_MS}ms ease;
      overflow: hidden;
      font-family: Georgia, "Times New Roman", serif;
    }

    .game-celebration-overlay.is-visible {
      opacity: 1;
    }

    .game-celebration-badge {
      position: relative;
      z-index: 3;
      min-width: min(82vw, 23rem);
      max-width: min(86vw, 28rem);
      border-radius: 1.8rem;
      padding: clamp(1.35rem, 5vw, 2.4rem);
      text-align: center;
      color: #fffaf0;
    }

    .game-celebration-title {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: clamp(2.2rem, 10vw, 4.1rem);
      line-height: 0.95;
      font-weight: 950;
      letter-spacing: 0;
    }

    .game-celebration-subtitle {
      margin-top: 0.75rem;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: clamp(0.68rem, 2.5vw, 0.82rem);
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .game-celebration-badge.is-correct {
      min-width: min(88vw, 31rem);
      max-width: min(90vw, 35rem);
      border: 4px solid #180d2b;
      border-radius: 2rem;
      padding: clamp(2.15rem, 7vw, 3.4rem) clamp(1.4rem, 5vw, 2.7rem) clamp(1.4rem, 5vw, 2.2rem);
      background: linear-gradient(135deg, #31b96a 0%, #86bd4a 54%, #f8cf35 100%);
      box-shadow: 10px 12px 0 #180d2b;
      overflow: visible;
      color: #ffffff;
    }

    .game-celebration-badge.is-wrong {
      min-width: min(88vw, 31rem);
      max-width: min(90vw, 35rem);
      border: 4px solid #180d2b;
      border-radius: 2rem;
      padding: clamp(2.15rem, 7vw, 3.4rem) clamp(1.4rem, 5vw, 2.7rem) clamp(1.4rem, 5vw, 2.2rem);
      background: linear-gradient(135deg, #f4a261 0%, #f7bd58 54%, #ffe16c 100%);
      box-shadow: 10px 12px 0 #180d2b;
      overflow: visible;
      color: #ffffff;
    }

    .game-celebration-badge.is-correct .game-celebration-title,
    .game-celebration-badge.is-wrong .game-celebration-title {
      text-shadow: 0 4px 0 rgba(24, 13, 43, 0.28);
    }

    .game-celebration-badge.is-correct .game-celebration-subtitle,
    .game-celebration-badge.is-wrong .game-celebration-subtitle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 2.15rem;
      margin-top: 0.85rem;
      border: 3px solid #180d2b;
      border-radius: 9999px;
      padding: 0.35rem 1.2rem;
      background: #fff8ec;
      color: #180d2b;
      box-shadow: 0 3px 0 rgba(24, 13, 43, 0.18);
    }

    .game-celebration-badge.is-wrong .game-celebration-subtitle {
      background: #fff2e4;
    }

    .game-celebration-icon {
      position: absolute;
      left: 50%;
      top: 0;
      display: grid;
      width: clamp(4.2rem, 17vw, 5.6rem);
      height: clamp(4.2rem, 17vw, 5.6rem);
      place-items: center;
      border: 4px solid #180d2b;
      border-radius: 9999px;
      background: #f8fff0;
      color: #169556;
      box-shadow: 0 7px 0 #180d2b;
      transform: translate(-50%, -56%);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: clamp(2.1rem, 8vw, 3.1rem);
      font-weight: 950;
    }

    .game-celebration-badge.is-wrong .game-celebration-icon {
      background: #fff4e8;
      color: #c25f3f;
    }

    .game-celebration-badge.is-wrong .game-celebration-title {
      font-size: clamp(1.9rem, 8vw, 3.45rem);
    }

    .game-celebration-shape {
      position: absolute;
      z-index: -1;
      display: block;
    }

    .game-celebration-shape.one {
      left: -1.2rem;
      top: -1.1rem;
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
      background: #ff3b6f;
      transform: rotate(12deg);
    }

    .game-celebration-shape.two {
      right: -1.1rem;
      top: -1.2rem;
      width: 1.5rem;
      height: 1.5rem;
      background: #b8ff2d;
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
      transform: rotate(-8deg);
    }

    .game-celebration-badge.is-wrong .game-celebration-shape.one {
      background: #d9825e;
    }

    .game-celebration-badge.is-wrong .game-celebration-shape.two {
      background: #ffc43d;
    }

    .game-celebration-badge.is-wrong .game-celebration-shape.four {
      background: #7c3aed;
    }

    .game-celebration-shape.three {
      left: 2rem;
      bottom: -1.2rem;
      width: 0.85rem;
      height: 0.85rem;
      border-radius: 9999px;
      background: #ffc43d;
    }

    .game-celebration-shape.four {
      right: 2rem;
      bottom: -1.05rem;
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
      background: #16b979;
      transform: rotate(28deg);
    }

    .celebration-pop {
      animation: celebration-pop 760ms cubic-bezier(.16,1.2,.24,1) both;
    }

    .celebration-drop {
      animation: celebration-drop 980ms cubic-bezier(.19,1.18,.35,1) both;
    }

    .celebration-wobble {
      animation: celebration-wobble 1100ms ease-in-out both;
    }

    .celebration-ripple {
      animation: celebration-ripple 1180ms ease-out both;
      border-radius: 9999px;
    }

    .celebration-draw {
      stroke-dasharray: 310;
      stroke-dashoffset: 310;
      animation: celebration-draw 720ms ease-out forwards;
    }

    .celebration-draw-late {
      stroke-dasharray: 180;
      stroke-dashoffset: 180;
      animation: celebration-draw 520ms 340ms ease-out forwards;
    }

    .celebration-rays line {
      transform-origin: 100px 100px;
      animation: celebration-ray 900ms ease-out both;
    }

    .celebration-soft-pulse {
      animation: celebration-soft-pulse 1250ms ease-out both;
    }

    @keyframes celebration-pop {
      0% { transform: translateY(18px) scale(0.78); opacity: 0; }
      55% { transform: translateY(-4px) scale(1.04); opacity: 1; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }

    @keyframes celebration-drop {
      0% { transform: translateY(-120vh) scale(0.9); opacity: 0; }
      58% { transform: translateY(18px) scale(1.02); opacity: 1; }
      78% { transform: translateY(-10px) scale(0.99); opacity: 1; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }

    @keyframes celebration-wobble {
      0% { transform: rotate(0deg) scale(0.88); opacity: 0; }
      18% { transform: rotate(-8deg) scale(1.04); opacity: 1; }
      38% { transform: rotate(7deg) scale(1); }
      58% { transform: rotate(-5deg) scale(1); }
      78% { transform: rotate(3deg) scale(1); }
      100% { transform: rotate(0deg) scale(1); opacity: 1; }
    }

    @keyframes celebration-ripple {
      0% { transform: scale(0.08); opacity: 0.84; }
      72% { opacity: 0.34; }
      100% { transform: scale(1.75); opacity: 0; }
    }

    @keyframes celebration-draw {
      to { stroke-dashoffset: 0; }
    }

    @keyframes celebration-ray {
      0% { transform: scale(0.18); opacity: 0; }
      38% { opacity: 1; }
      100% { transform: scale(1.35); opacity: 0; }
    }

    @keyframes celebration-soft-pulse {
      0% { transform: scale(0.25); opacity: 0; }
      30% { opacity: 0.62; }
      100% { transform: scale(1.7); opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .game-celebration-overlay,
      .game-celebration-badge,
      .celebration-pop,
      .celebration-drop,
      .celebration-wobble,
      .celebration-ripple,
      .celebration-draw,
      .celebration-draw-late,
      .celebration-rays line,
      .celebration-soft-pulse {
        animation: none !important;
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function createOverlay(tone: CelebrationTone) {
  ensureCelebrationStyles();

  const overlay = document.createElement("div");
  overlay.className = "game-celebration-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.background =
    tone === "correct"
      ? "radial-gradient(circle at center, rgba(247, 210, 122, 0.34), rgba(31, 122, 103, 0.18) 38%, rgba(47, 31, 22, 0.34) 100%)"
      : "radial-gradient(circle at center, rgba(244, 190, 155, 0.30), rgba(149, 91, 58, 0.17) 42%, rgba(47, 31, 22, 0.28) 100%)";

  document.body.appendChild(overlay);
  window.requestAnimationFrame(() => overlay.classList.add("is-visible"));

  window.setTimeout(() => {
    overlay.classList.remove("is-visible");
    window.setTimeout(() => overlay.remove(), FADE_MS + 40);
  }, OVERLAY_DURATION_MS);

  return overlay;
}

function makeBadge(title: string, subtitle: string, tone: CelebrationTone, className = "celebration-pop") {
  const badge = document.createElement("div");
  badge.className = `game-celebration-badge is-${tone} ${className}`;

  if (tone === "correct") {
    badge.innerHTML = `
      <span class="game-celebration-shape one"></span>
      <span class="game-celebration-shape two"></span>
      <span class="game-celebration-shape three"></span>
      <span class="game-celebration-shape four"></span>
      <div class="game-celebration-icon">✓</div>
      <div class="game-celebration-title">${escapeHtml(title)}</div>
      <div class="game-celebration-subtitle">${escapeHtml(subtitle)}</div>
    `;
    return badge;
  }

  badge.innerHTML = `
    <span class="game-celebration-shape one"></span>
    <span class="game-celebration-shape two"></span>
    <span class="game-celebration-shape three"></span>
    <span class="game-celebration-shape four"></span>
    <div class="game-celebration-icon">×</div>
    <div class="game-celebration-title">${escapeHtml(title)}</div>
    <div class="game-celebration-subtitle">${escapeHtml(subtitle)}</div>
  `;

  return badge;
}

function simpleReducedCelebration(tone: CelebrationTone, locale: CelebrationLocale) {
  const copy = getCelebrationCopy(locale);
  const overlay = createOverlay(tone);
  overlay.appendChild(
    makeBadge(
      tone === "correct" ? copy.correctTitle : copy.wrongTitle,
      tone === "correct" ? copy.correctSubtitle : copy.wrongSubtitle,
      tone,
    ),
  );
}

function correctConfetti(copy: CelebrationCopy) {
  const overlay = createOverlay("correct");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const colors = ["#1f7a67", "#f2c46f", "#ff8f70", "#86efac", "#fbf3e6"];
  const particles = Array.from({ length: Math.min(170, Math.floor(window.innerWidth / 5)) }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.38,
    vx: (Math.random() - 0.5) * 13,
    vy: Math.random() * -10 - 4,
    size: Math.random() * 7 + 4,
    spin: Math.random() * Math.PI,
    color: randomItem(colors),
  }));
  let frame = 0;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  overlay.appendChild(canvas);
  overlay.appendChild(makeBadge(copy.correctTitle, copy.correctSubtitle, "correct"));

  function draw() {
    if (!context) {
      return;
    }

    frame += 1;
    context.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.34;
      particle.spin += 0.18;

      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.spin);
      context.fillStyle = particle.color;
      context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.62);
      context.restore();
    });

    if (frame < 95) {
      window.requestAnimationFrame(draw);
    }
  }

  draw();
}

function correctStarburst(copy: CelebrationCopy) {
  const overlay = createOverlay("correct");
  overlay.innerHTML = `
    <svg class="celebration-rays" viewBox="0 0 200 200" style="position:absolute;width:min(110vw,48rem);height:min(110vw,48rem);">
      ${Array.from({ length: 22 }, (_, index) => {
        const angle = (index / 22) * 360;
        const color = index % 3 === 0 ? "#f2c46f" : index % 3 === 1 ? "#1f7a67" : "#fbf3e6";
        return `<line x1="100" y1="34" x2="100" y2="4" stroke="${color}" stroke-width="5" stroke-linecap="round" transform="rotate(${angle} 100 100)" />`;
      }).join("")}
    </svg>
  `;
  overlay.appendChild(makeBadge(copy.correctTitle, copy.correctSubtitle, "correct"));
}

function correctCheckmark(copy: CelebrationCopy) {
  const overlay = createOverlay("correct");
  const badge = makeBadge(copy.correctTitle, copy.correctSubtitle, "correct");
  overlay.appendChild(badge);
}

function correctRipple(copy: CelebrationCopy) {
  const overlay = createOverlay("correct");
  const ripple = document.createElement("div");
  ripple.className = "celebration-ripple";
  ripple.style.position = "absolute";
  ripple.style.width = "min(130vw, 58rem)";
  ripple.style.height = "min(130vw, 58rem)";
  ripple.style.background = "radial-gradient(circle, rgba(34,197,94,0.52), rgba(242,196,111,0.24) 45%, transparent 70%)";
  overlay.appendChild(ripple);
  overlay.appendChild(makeBadge(copy.correctTitle, copy.correctSubtitle, "correct"));
}

function wrongPulse(copy: CelebrationCopy) {
  const overlay = createOverlay("wrong");
  const pulse = document.createElement("div");
  pulse.className = "celebration-soft-pulse";
  pulse.style.position = "absolute";
  pulse.style.width = "min(120vw, 46rem)";
  pulse.style.height = "min(120vw, 46rem)";
  pulse.style.borderRadius = "9999px";
  pulse.style.background = "radial-gradient(circle, rgba(204,127,91,0.42), rgba(244,190,155,0.22) 46%, transparent 72%)";
  overlay.appendChild(pulse);
  overlay.appendChild(makeBadge(copy.wrongTitle, copy.wrongSubtitle, "wrong", "celebration-pop"));
}

function wrongCross(copy: CelebrationCopy) {
  const overlay = createOverlay("wrong");
  const badge = makeBadge(copy.wrongSoftTitle, copy.wrongSubtitle, "wrong");
  overlay.appendChild(badge);
}

function wrongWobble(copy: CelebrationCopy) {
  const overlay = createOverlay("wrong");
  overlay.appendChild(makeBadge(copy.wrongAgainTitle, copy.wrongAgainSubtitle, "wrong", "celebration-wobble"));
}

function wrongDrop(copy: CelebrationCopy) {
  const overlay = createOverlay("wrong");
  const shadow = document.createElement("div");
  shadow.style.position = "absolute";
  shadow.style.top = "calc(50% + min(25vw, 8rem))";
  shadow.style.width = "min(58vw, 17rem)";
  shadow.style.height = "2.2rem";
  shadow.style.borderRadius = "9999px";
  shadow.style.background = "rgba(72, 47, 31, 0.22)";
  shadow.style.filter = "blur(14px)";
  overlay.appendChild(shadow);
  overlay.appendChild(makeBadge(copy.wrongTitle, copy.wrongAgainSubtitle, "wrong", "celebration-drop"));
}

export function celebrateCorrect(locale: CelebrationLocale = "fr") {
  if (typeof window === "undefined") {
    return;
  }

  const copy = getCelebrationCopy(locale);

  if (prefersReducedMotion()) {
    simpleReducedCelebration("correct", locale);
    return;
  }

  randomItem([correctConfetti, correctStarburst, correctCheckmark, correctRipple])(copy);
}

export function celebrateWrong(locale: CelebrationLocale = "fr") {
  if (typeof window === "undefined") {
    return;
  }

  const copy = getCelebrationCopy(locale);

  if (prefersReducedMotion()) {
    simpleReducedCelebration("wrong", locale);
    return;
  }

  randomItem([wrongPulse, wrongCross, wrongWobble, wrongDrop])(copy);
}
