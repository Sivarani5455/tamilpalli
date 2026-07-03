"use client";

type CelebrationTone = "correct" | "wrong";

const OVERLAY_DURATION_MS = 1550;
const FADE_MS = 180;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
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
      border: 1px solid rgba(255, 255, 255, 0.64);
      border-radius: 2rem;
      padding: clamp(1.35rem, 5vw, 2.4rem);
      text-align: center;
      color: #fffaf0;
      box-shadow: 0 28px 80px -32px rgba(45, 32, 23, 0.7);
      backdrop-filter: blur(16px);
    }

    .game-celebration-title {
      font-size: clamp(2.7rem, 13vw, 6rem);
      line-height: 0.92;
      font-weight: 700;
      letter-spacing: 0;
    }

    .game-celebration-subtitle {
      margin-top: 0.9rem;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: clamp(0.68rem, 2.5vw, 0.82rem);
      font-weight: 800;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      opacity: 0.78;
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
  badge.className = `game-celebration-badge ${className}`;
  badge.style.background =
    tone === "correct"
      ? "linear-gradient(135deg, rgba(31, 122, 103, 0.94), rgba(211, 146, 46, 0.94))"
      : "linear-gradient(135deg, rgba(158, 101, 67, 0.94), rgba(204, 127, 91, 0.9))";

  badge.innerHTML = `
    <div class="game-celebration-title">${title}</div>
    <div class="game-celebration-subtitle">${subtitle}</div>
  `;

  return badge;
}

function simpleReducedCelebration(tone: CelebrationTone) {
  const overlay = createOverlay(tone);
  overlay.appendChild(
    makeBadge(
      tone === "correct" ? "Bravo" : "Presque",
      tone === "correct" ? "Bonne reponse" : "Continue",
      tone,
    ),
  );
}

function correctConfetti() {
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
  overlay.appendChild(makeBadge("Bravo", "Bonne reponse", "correct"));

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

function correctStarburst() {
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
  overlay.appendChild(makeBadge("Super", "Tu as trouve", "correct"));
}

function correctCheckmark() {
  const overlay = createOverlay("correct");
  const badge = makeBadge("Oui", "Bonne reponse", "correct");
  const svg = document.createElement("div");
  svg.innerHTML = `
    <svg viewBox="0 0 160 160" style="width:min(52vw,14rem);height:min(52vw,14rem);margin:0 auto 1rem;display:block;">
      <circle class="celebration-draw" cx="80" cy="80" r="58" fill="none" stroke="#fff7dc" stroke-width="9" stroke-linecap="round" />
      <path class="celebration-draw-late" d="M48 82 L70 104 L114 57" fill="none" stroke="#86efac" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
  badge.prepend(svg);
  overlay.appendChild(badge);
}

function correctRipple() {
  const overlay = createOverlay("correct");
  const ripple = document.createElement("div");
  ripple.className = "celebration-ripple";
  ripple.style.position = "absolute";
  ripple.style.width = "min(130vw, 58rem)";
  ripple.style.height = "min(130vw, 58rem)";
  ripple.style.background = "radial-gradient(circle, rgba(34,197,94,0.52), rgba(242,196,111,0.24) 45%, transparent 70%)";
  overlay.appendChild(ripple);
  overlay.appendChild(makeBadge("Gagne", "Continue comme ca", "correct"));
}

function wrongPulse() {
  const overlay = createOverlay("wrong");
  const pulse = document.createElement("div");
  pulse.className = "celebration-soft-pulse";
  pulse.style.position = "absolute";
  pulse.style.width = "min(120vw, 46rem)";
  pulse.style.height = "min(120vw, 46rem)";
  pulse.style.borderRadius = "9999px";
  pulse.style.background = "radial-gradient(circle, rgba(204,127,91,0.42), rgba(244,190,155,0.22) 46%, transparent 72%)";
  overlay.appendChild(pulse);
  overlay.appendChild(makeBadge("Presque", "Essaie encore", "wrong", "celebration-pop"));
}

function wrongCross() {
  const overlay = createOverlay("wrong");
  const badge = makeBadge("Pas tout a fait", "Tu peux reessayer", "wrong");
  const svg = document.createElement("div");
  svg.innerHTML = `
    <svg viewBox="0 0 160 160" style="width:min(52vw,14rem);height:min(52vw,14rem);margin:0 auto 1rem;display:block;">
      <circle class="celebration-draw" cx="80" cy="80" r="58" fill="none" stroke="#fff1e8" stroke-width="9" stroke-linecap="round" />
      <path class="celebration-draw-late" d="M55 55 L105 105 M105 55 L55 105" fill="none" stroke="#f6b08d" stroke-width="11" stroke-linecap="round" />
    </svg>
  `;
  badge.prepend(svg);
  overlay.appendChild(badge);
}

function wrongWobble() {
  const overlay = createOverlay("wrong");
  overlay.appendChild(makeBadge("Encore", "Regarde bien", "wrong", "celebration-wobble"));
}

function wrongDrop() {
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
  overlay.appendChild(makeBadge("Presque", "Tu y es presque", "wrong", "celebration-drop"));
}

export function celebrateCorrect() {
  if (typeof window === "undefined") {
    return;
  }

  if (prefersReducedMotion()) {
    simpleReducedCelebration("correct");
    return;
  }

  randomItem([correctConfetti, correctStarburst, correctCheckmark, correctRipple])();
}

export function celebrateWrong() {
  if (typeof window === "undefined") {
    return;
  }

  if (prefersReducedMotion()) {
    simpleReducedCelebration("wrong");
    return;
  }

  randomItem([wrongPulse, wrongCross, wrongWobble, wrongDrop])();
}
