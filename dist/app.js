const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const rootEl = document.documentElement;
rootEl.classList.add('js-motion');

const themeToggle = document.querySelector('#theme-toggle');
function applyTheme(theme) {
  rootEl.setAttribute('data-theme', theme);
}
applyTheme(darkScheme.matches ? 'dark' : 'light');
darkScheme.addEventListener('change', event => {
  applyTheme(event.matches ? 'dark' : 'light');
});
themeToggle?.addEventListener('click', () => {
  const current = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(current);
});

const siteHeader = document.querySelector('.site-header');
const scrollProgressEl = document.querySelector('#scroll-progress');
const heroSection = document.querySelector('.hero');
const heroImage = document.querySelector('.hero-image');
const floatEls = [...document.querySelectorAll('[data-float]')];
const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
const tiltCards = [...document.querySelectorAll('[data-tilt-card]')];
const floatingContact = document.querySelector('.floating-contact');
const mainEl = document.querySelector('#conteudo');
const heroBotanicalAnchor = document.querySelector('#hero-botanical-anchor');
const aboutBotanicalAnchor = document.querySelector('#about-botanical-anchor');
const benefitBotanicalAnchor = document.querySelector('#benefit-botanical-anchor');
const travelingBotanicalWrap = document.querySelector('#traveling-botanical-wrap');
const travelingBotanical = document.querySelector('#traveling-botanical');
const heroBotanicalCard = document.querySelector('#hero-botanical-card');
const aboutBotanicalCard = document.querySelector('#about-botanical-card');
const benefitBotanicalCard = document.querySelector('#benefit-botanical-card');

const faqFlowerAnchor = document.querySelector('#faq-flower-anchor');
const contactFlowerAnchor = document.querySelector('#contact-flower-anchor');
const travelingFlowersWrap = document.querySelector('#traveling-flowers-wrap');
const travelingFlowers = document.querySelector('#traveling-flowers');

let lenis;
let revealObserver;
let floatItems = [];
let parallaxItems = [];
let cardStates = new Map();
let lastScrollY = window.scrollY;
let smoothVelocity = 0;
let rafId = 0;

let cachedVh = window.innerHeight || 800;
let cachedMaxScroll = 1;
let cachedHeroHeight = cachedVh;
let cachedIsMobile = window.innerWidth <= 820;
let lastProgressStr = '';
let lastIsScrolled = null;
let lastIsPastHero = null;
let lastHeroScrollY = -1;

const botanicalFlight = {
  active: false,
  leg1Start: 0,
  leg1End: 1,
  leg2Start: 2,
  leg2End: 3,
  delta1X: 0,
  delta1Y: 0,
  scale1: 1.3,
  delta2X: 0,
  delta2Y: 0,
  scale2: 1.15,
  cur1: 0,
  cur2: 0
};

const flowerFlight = {
  active: false,
  startScroll: 0,
  endScroll: 1,
  deltaX: 0,
  deltaY: 0,
  targetScale: 1.45,
  cur: 0
};

function getLayoutBoxInMain(el, container) {
  let left = 0;
  let top = 0;
  let node = el;
  while (node && node !== container && node !== document.body && node !== document.documentElement) {
    left += node.offsetLeft + (node.offsetParent ? node.offsetParent.clientLeft : 0);
    top += node.offsetTop + (node.offsetParent ? node.offsetParent.clientTop : 0);
    node = node.offsetParent;
  }
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  return {
    left,
    top,
    width,
    height,
    centerX: left + width * 0.5,
    centerY: top + height * 0.5
  };
}

// Initialize 3D Tilt state per card
tiltCards.forEach((card, idx) => {
  const state = {
    el: card,
    strength: Number(card.dataset.tiltStrength || 5.5),
    isPromise: card.classList.contains('promise-item'),
    phase: idx * 0.9,
    targetX: 0,
    targetY: 0,
    curX: 0,
    curY: 0,
    hovered: false,
    rect: null,
    rectScrollY: -1
  };
  cardStates.set(card, state);

  card.addEventListener('pointerenter', () => {
    state.rect = card.getBoundingClientRect();
    state.rectScrollY = lastScrollY;
  });

  card.addEventListener('pointermove', event => {
    if (!state.rect || Math.abs(state.rectScrollY - lastScrollY) > 1) {
      state.rect = card.getBoundingClientRect();
      state.rectScrollY = lastScrollY;
    }
    const rect = state.rect;
    if (!rect.width || !rect.height) return;
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;
    state.targetX = (relX - 0.5) * 2; // -1 .. +1
    state.targetY = (relY - 0.5) * 2; // -1 .. +1
    state.hovered = true;
    card.style.setProperty('--spot-x', `${(relX * 100).toFixed(1)}%`);
    card.style.setProperty('--spot-y', `${(relY * 100).toFixed(1)}%`);
  });

  card.addEventListener('pointerleave', () => {
    state.targetX = 0;
    state.targetY = 0;
    state.hovered = false;
    state.rect = null;
  });
});

function measureMotion() {
  const currentScroll = lenis ? lenis.scroll : window.scrollY;
  const vh = window.innerHeight || 800;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
  cachedVh = vh;
  cachedMaxScroll = maxScroll;
  cachedHeroHeight = heroSection ? heroSection.offsetHeight : vh;
  cachedIsMobile = window.innerWidth <= 820;
  const mainTopDoc = mainEl ? mainEl.getBoundingClientRect().top + currentScroll : 0;

  floatItems = floatEls.map((el, idx) => {
    const anchor = el.closest('.benefit-card, .about-visual, .hero-card, .faq-intro, .contact-art') || el.parentElement || el;
    const rect = anchor.getBoundingClientRect();
    const parentTiltCard = el.closest('[data-tilt-card]');
    const prev = floatItems[idx];
    return {
      el,
      cardState: parentTiltCard ? cardStates.get(parentTiltCard) : null,
      top: rect.top + currentScroll,
      height: Math.max(rect.height, 1),
      amount: Number(el.dataset.float || -90),
      drift: Number(el.dataset.drift || 20),
      rotate: Number(el.dataset.rotate || 14),
      scale: Number(el.dataset.scale || 0.15),
      phase: Number(el.dataset.phase || idx * 1.1),
      curProgress: prev ? prev.curProgress : 0
    };
  });

  parallaxItems = parallaxEls.map((el, idx) => {
    const container = el.parentElement || el;
    const rect = container.getBoundingClientRect();
    const prev = parallaxItems[idx];
    return {
      el,
      top: rect.top + currentScroll,
      height: Math.max(rect.height, 1),
      strength: Number(el.dataset.parallax || 48),
      curProgress: prev ? prev.curProgress : 0,
      lastTy: ''
    };
  });

  if (
    mainEl &&
    heroBotanicalAnchor &&
    aboutBotanicalAnchor &&
    benefitBotanicalAnchor &&
    travelingBotanicalWrap &&
    travelingBotanical
  ) {
    const b0 = getLayoutBoxInMain(heroBotanicalAnchor, mainEl);
    const b1 = getLayoutBoxInMain(aboutBotanicalAnchor, mainEl);
    const b2 = getLayoutBoxInMain(benefitBotanicalAnchor, mainEl);

    travelingBotanicalWrap.style.left = `${b0.left.toFixed(1)}px`;
    travelingBotanicalWrap.style.top = `${b0.top.toFixed(1)}px`;
    travelingBotanicalWrap.style.width = `${b0.width.toFixed(1)}px`;

    const isMobile = cachedIsMobile;
    const docY0 = mainTopDoc + b0.centerY;
    const docY1 = mainTopDoc + b1.centerY;
    const docY2 = mainTopDoc + b2.centerY;

    const leg1Start = isMobile ? Math.max(36, docY0 - vh * 0.52) : Math.max(18, vh * 0.05);
    const leg1End = isMobile ? Math.max(leg1Start + 160, docY1 - vh * 0.58) : Math.max(leg1Start + 180, docY1 - vh * 0.68);
    const leg2Start = isMobile ? Math.max(leg1End + 60, docY1 - vh * 0.28) : Math.max(leg1End + 80, docY1 - vh * 0.34);
    const leg2End = isMobile ? Math.max(leg2Start + 200, docY2 - vh * 0.55) : Math.max(leg2Start + 240, docY2 - vh * 0.6);

    botanicalFlight.active = true;
    botanicalFlight.leg1Start = leg1Start;
    botanicalFlight.leg1End = leg1End;
    botanicalFlight.leg2Start = leg2Start;
    botanicalFlight.leg2End = leg2End;
    botanicalFlight.delta1X = b1.centerX - b0.centerX;
    botanicalFlight.delta1Y = b1.centerY - b0.centerY;
    botanicalFlight.scale1 = b0.width > 0 ? b1.width / b0.width : 1.32;
    botanicalFlight.delta2X = b2.centerX - b0.centerX;
    botanicalFlight.delta2Y = b2.centerY - b0.centerY;
    botanicalFlight.scale2 = b0.width > 0 ? b2.width / b0.width : 1.15;
  }

  if (mainEl && faqFlowerAnchor && contactFlowerAnchor && travelingFlowers) {
    const isMobile = cachedIsMobile;
    const startBox = getLayoutBoxInMain(faqFlowerAnchor, mainEl);
    const endBox = getLayoutBoxInMain(contactFlowerAnchor, mainEl);
    const startCenterY = mainTopDoc + startBox.centerY;
    const endCenterY = mainTopDoc + endBox.centerY;

    const endScroll = Math.max(120, Math.min(endCenterY - vh * (isMobile ? 0.58 : 0.52), maxScroll - 16));
    const startScroll = isMobile
      ? Math.max(0, Math.min(startCenterY - vh * 0.45, endScroll - 260))
      : Math.max(0, Math.min(startCenterY - vh * 0.56, endScroll - Math.min(440, vh * 0.52)));

    flowerFlight.active = true;
    flowerFlight.startScroll = startScroll;
    flowerFlight.endScroll = Math.max(startScroll + 120, endScroll);
    flowerFlight.deltaX = endBox.centerX - startBox.centerX;
    flowerFlight.deltaY = endBox.centerY - startBox.centerY;
    flowerFlight.targetScale = startBox.width > 0 ? endBox.width / startBox.width : 1.45;
  }
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function tick(now) {
  if (lenis) {
    lenis.raf(now);
  }

  const scrollY = lenis ? lenis.scroll : window.scrollY;
  const rawDelta = scrollY - lastScrollY;
  lastScrollY = scrollY;
  const targetVel = lenis ? lenis.velocity : rawDelta * 0.65;
  smoothVelocity += (targetVel - smoothVelocity) * 0.14;
  const velClamp = Math.max(-4, Math.min(4, smoothVelocity * 0.18));

  const vh = cachedVh;
  const maxScroll = cachedMaxScroll;
  const pageProgress = Math.max(0, Math.min(1, scrollY / maxScroll));

  if (scrollProgressEl) {
    const progressStr = pageProgress.toFixed(4);
    if (progressStr !== lastProgressStr) {
      lastProgressStr = progressStr;
      scrollProgressEl.style.transform = `scaleX(${progressStr})`;
    }
  }
  if (siteHeader) {
    const isScrolled = scrollY > 18;
    if (isScrolled !== lastIsScrolled) {
      lastIsScrolled = isScrolled;
      siteHeader.classList.toggle('is-scrolled', isScrolled);
    }
    const isPastHero = scrollY > cachedHeroHeight - 64;
    if (isPastHero !== lastIsPastHero) {
      lastIsPastHero = isPastHero;
      siteHeader.classList.toggle('is-past-hero', isPastHero);
    }
  }

  // Hero background deep parallax + subtle zoom
  if (heroImage && scrollY < vh * 1.5 && Math.abs(scrollY - lastHeroScrollY) > 0.05) {
    lastHeroScrollY = scrollY;
    const heroRatio = Math.max(0, Math.min(1.5, scrollY / vh));
    const shiftY = heroRatio * 115;
    const scaleVal = 1.04 + heroRatio * 0.06;
    heroImage.style.transform = `translate3d(0, calc(-4% + ${shiftY.toFixed(2)}px), 0) scale(${scaleVal.toFixed(3)})`;
  }

  const t = now * 0.001;

  // Update 3D Tilt Cards
  for (const state of cardStates.values()) {
    state.curX += (state.targetX - state.curX) * 0.12;
    state.curY += (state.targetY - state.curY) * 0.12;
    if (state.isPromise && state.el.classList.contains('is-visible') && scrollY < vh * 1.4) {
      const idlePitch = Math.sin(t * 1.8 + state.phase) * 1.6 + velClamp * 1.1;
      const idleRoll = Math.cos(t * 1.4 + state.phase) * 1.4;
      const rotY = (state.curX * state.strength + idleRoll).toFixed(2);
      const rotX = (-state.curY * state.strength + idlePitch).toFixed(2);
      const lift = state.hovered ? -7 : Math.sin(t * 2 + state.phase) * 2.5;
      state.el.style.transform = `perspective(1100px) translate3d(0, ${lift.toFixed(2)}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    } else if (Math.abs(state.curX) > 0.002 || Math.abs(state.curY) > 0.002 || state.hovered) {
      const rotY = (state.curX * state.strength).toFixed(2);
      const rotX = (-state.curY * state.strength).toFixed(2);
      const lift = state.hovered ? -5 : 0;
      state.el.style.transform = `perspective(1100px) translate3d(0, ${lift}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    } else if (state.el.style.transform) {
      state.el.style.removeProperty('transform');
    }
  }

  // Update 3D PNG Cutouts (Scroll Scrub + Continuous 3D Levitation + Velocity Tilt + Pointer Depth)
  for (const item of floatItems) {
    if (item.top > scrollY + vh + 360 || item.top + item.height < scrollY - 360) continue;
    const rawProgress = (scrollY + vh * 0.5 - (item.top + item.height * 0.5)) / (vh * 0.85);
    const targetProgress = Math.max(-1.15, Math.min(1.15, rawProgress));
    item.curProgress += (targetProgress - item.curProgress) * 0.11;
    const p = item.curProgress;

    // Continuous 3D floating wave (keeps 3D elements alive even when scroll pauses)
    const idleY = Math.sin(t * 2.1 + item.phase) * 11;
    const idleX = Math.cos(t * 1.55 + item.phase) * 6.5;
    const idleRotZ = Math.sin(t * 1.35 + item.phase) * 3.8;
    const idleRotX = Math.cos(t * 1.7 + item.phase) * 6.5;
    const idleRotY = Math.sin(t * 1.25 + item.phase) * 8;

    // Pointer 3D parallax offset if parent card is hovered
    const ptrX = item.cardState ? item.cardState.curX * 24 : 0;
    const ptrY = item.cardState ? item.cardState.curY * 20 : 0;
    const ptrRotY = item.cardState ? item.cardState.curX * 12 : 0;
    const ptrRotX = item.cardState ? -item.cardState.curY * 12 : 0;

    // Combined 3D coordinates
    const tx = (p * item.drift + idleX + ptrX).toFixed(2);
    const ty = (p * item.amount + idleY + ptrY).toFixed(2);
    const rotZ = (p * item.rotate + idleRotZ + velClamp * 1.3).toFixed(2);
    const rotX = (-p * 14 + idleRotX + velClamp * 1.6 + ptrRotX).toFixed(2);
    const rotY = (p * 16 + idleRotY + ptrRotY).toFixed(2);
    const focusBoost = Math.max(0, 1 - Math.min(1, Math.abs(p)));
    const sc = (0.9 + focusBoost * item.scale + Math.sin(t * 1.9 + item.phase) * 0.022).toFixed(3);

    item.el.style.transform = `perspective(900px) translate3d(${tx}px, ${ty}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${sc})`;
  }

  // 3-Section Botanical Leaf Flight: Hero (#hero-botanical-anchor) -> About (#about-botanical-anchor) -> Benefits (#benefit-botanical-anchor)
  if (
    botanicalFlight.active &&
    travelingBotanical &&
    (scrollY <= botanicalFlight.leg2End + vh * 1.25 || botanicalFlight.cur2 < 0.999)
  ) {
    const span1 = Math.max(1, botanicalFlight.leg1End - botanicalFlight.leg1Start);
    const span2 = Math.max(1, botanicalFlight.leg2End - botanicalFlight.leg2Start);
    const target1 = Math.max(0, Math.min(1, (scrollY - botanicalFlight.leg1Start) / span1));
    const target2 = Math.max(0, Math.min(1, (scrollY - botanicalFlight.leg2Start) / span2));

    botanicalFlight.cur1 += (target1 - botanicalFlight.cur1) * 0.12;
    botanicalFlight.cur2 += (target2 - botanicalFlight.cur2) * 0.12;

    const e1 = easeInOutCubic(botanicalFlight.cur1);
    const e2 = easeInOutCubic(botanicalFlight.cur2);

    const arc1 = Math.sin(e1 * Math.PI);
    const step1 = Math.sin(e1 * Math.PI * 2);
    const arc2 = Math.sin(e2 * Math.PI);
    const step2 = Math.sin(e2 * Math.PI * 2);

    // Weights for the 3 resting anchors (Stage 0: Hero, Stage 1: About, Stage 2: Benefits)
    const w0 = 1 - e1;
    const w1 = e1 * (1 - e2);
    const w2 = e2;

    const c0 = heroBotanicalCard ? cardStates.get(heroBotanicalCard) : null;
    const c1 = aboutBotanicalCard ? cardStates.get(aboutBotanicalCard) : null;
    const c2 = benefitBotanicalCard ? cardStates.get(benefitBotanicalCard) : null;

    const cardTiltX = (c0 ? c0.curX * w0 : 0) + (c1 ? c1.curX * w1 : 0) + (c2 ? c2.curX * w2 : 0);
    const cardTiltY = (c0 ? c0.curY * w0 : 0) + (c1 ? c1.curY * w1 : 0) + (c2 ? c2.curY * w2 : 0);

    // Continuous 3D levitation in all 3 sections and during flight
    const idleX = Math.cos(t * 1.55 + 0.5) * 6.5;
    const idleY = Math.sin(t * 2.1 + 0.5) * 10;
    const idleRotZ = Math.sin(t * 1.35 + 0.5) * 3.5;
    const idleRotX = Math.cos(t * 1.7 + 0.5) * 6;
    const idleRotY = Math.sin(t * 1.25 + 0.5) * 7.5;

    const lateralScale = cachedIsMobile ? 0.25 : 1;
    const baseX = w1 * botanicalFlight.delta1X + w2 * botanicalFlight.delta2X;
    const baseY = w1 * botanicalFlight.delta1Y + w2 * botanicalFlight.delta2Y;
    const arcX = (step1 * 24 - arc1 * 30 + step2 * 30 + arc2 * 26) * lateralScale;
    const arcY = -arc1 * 28 - arc2 * 32;

    const tx = (baseX + arcX + idleX + cardTiltX * 22).toFixed(2);
    const ty = (baseY + arcY + idleY + cardTiltY * 18).toFixed(2);

    const rotZ = (arc1 * -16 + step1 * 6 + arc2 * 15 + step2 * 7 + idleRotZ + velClamp * 1.25).toFixed(2);
    const rotX = ((arc1 + arc2) * 17 + idleRotX + velClamp * 1.5 - cardTiltY * 11).toFixed(2);
    const rotY = (arc1 * -18 + arc2 * 20 + idleRotY + cardTiltX * 11).toFixed(2);

    const baseScale = w0 * 1 + w1 * botanicalFlight.scale1 + w2 * botanicalFlight.scale2;
    const sc = (baseScale + (arc1 + arc2) * 0.1 + Math.sin(t * 1.9 + 0.5) * 0.02).toFixed(3);

    travelingBotanical.style.transform = `translate3d(${tx}px, ${ty}px, 0) perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${sc})`;
  }

  // Cross-Section 3D Flower Flight: from #faq-flower-anchor (#duvidas) -> #contact-flower-anchor (#contato)
  if (
    flowerFlight.active &&
    travelingFlowers &&
    (scrollY >= flowerFlight.startScroll - vh * 1.25 || flowerFlight.cur > 0.001)
  ) {
    const span = Math.max(1, flowerFlight.endScroll - flowerFlight.startScroll);
    const rawFlight = (scrollY - flowerFlight.startScroll) / span;
    const targetFlight = Math.max(0, Math.min(1, rawFlight));
    flowerFlight.cur += (targetFlight - flowerFlight.cur) * 0.12;
    const p = flowerFlight.cur;

    if (p > 0.01 && travelingFlowersWrap && !travelingFlowersWrap.classList.contains('is-visible')) {
      travelingFlowersWrap.classList.add('is-visible');
    }

    // Smooth cubic ease-in-out for the cross-section transition
    const eased = easeInOutCubic(p);
    // Sinusoidal mid-flight lift (0 at FAQ start, 1 across section boundary, 0 at Contact landing)
    const arc = Math.sin(eased * Math.PI);
    // Gentle S-curve walking sway as it traverses between sections
    const stepWave = Math.sin(eased * Math.PI * 2);

    // Continuous 3D levitation in both resting states and during flight
    const idleX = Math.cos(t * 1.6 + 1.4) * 6;
    const idleY = Math.sin(t * 2.1 + 1.4) * 9.5;
    const idleRotZ = Math.sin(t * 1.35 + 1.4) * 3.2;
    const idleRotX = Math.cos(t * 1.7 + 1.4) * 5.5;
    const idleRotY = Math.sin(t * 1.25 + 1.4) * 7;

    const flowerLateralScale = cachedIsMobile ? 0.25 : 1;
    const tx = (eased * flowerFlight.deltaX + (stepWave * 22 - arc * 26) * flowerLateralScale + idleX).toFixed(2);
    const ty = (eased * flowerFlight.deltaY - arc * 34 + idleY).toFixed(2);
    const rotZ = (arc * -14 + stepWave * 6 + idleRotZ + velClamp * 1.2).toFixed(2);
    const rotX = (arc * 18 + idleRotX + velClamp * 1.5).toFixed(2);
    const rotY = (arc * -20 + stepWave * 8 + idleRotY).toFixed(2);

    const baseScale = 1 + (flowerFlight.targetScale - 1) * eased;
    const sc = (baseScale + arc * 0.1 + Math.sin(t * 1.9 + 1.4) * 0.02).toFixed(3);

    travelingFlowers.style.transform = `translate3d(${tx}px, ${ty}px, 0) perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${sc})`;
  }

  // Update Photo Parallax
  for (const item of parallaxItems) {
    if (item.top > scrollY + vh + 300 || item.top + item.height < scrollY - 300) continue;
    const rawProgress = (scrollY + vh * 0.5 - (item.top + item.height * 0.5)) / vh;
    const targetProgress = Math.max(-1, Math.min(1, rawProgress));
    item.curProgress += (targetProgress - item.curProgress) * 0.12;
    const ty = (item.curProgress * item.strength).toFixed(2);
    if (ty !== item.lastTy) {
      item.lastTy = ty;
      item.el.style.transform = `translate3d(0, ${ty}px, 0) scale(1.05)`;
    }
  }

  rafId = requestAnimationFrame(tick);
}

function setupMotion() {
  cancelAnimationFrame(rafId);
  lenis?.destroy();
  lenis = undefined;
  revealObserver?.disconnect();

  if (window.Lenis) {
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      syncTouch: false,
      anchors: { offset: -72 },
      allowNestedScroll: true
    });
  }

  revealObserver = new IntersectionObserver(
    entries => {
      const vh = window.innerHeight || 800;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else if (entry.boundingClientRect.top >= vh * 0.94) {
          // Reset when scrolled back up so scrolling down replays the entrance ("surgimento")
          entry.target.classList.remove('is-visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  measureMotion();
  rafId = requestAnimationFrame(tick);
}

setupMotion();

// Re-measure flight path whenever an FAQ accordion item opens or closes
document.querySelectorAll('.faq-list details').forEach(detail => {
  detail.addEventListener('toggle', () => {
    requestAnimationFrame(measureMotion);
  });
});

let resizeFrame = 0;
window.addEventListener(
  'resize',
  () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(measureMotion);
  },
  { passive: true }
);
window.addEventListener('load', measureMotion);
document.fonts?.ready.then(measureMotion);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    lenis?.stop();
    cancelAnimationFrame(rafId);
  } else {
    if (!document.querySelector('dialog[open]')) lenis?.start();
    measureMotion();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }
});

// Mobile Navigation
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function closeMenu() {
  if (!mobileNav || !menuButton) return;
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
mobileNav?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobileNav && !mobileNav.hidden) {
    closeMenu();
    menuButton?.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header, .mobile-nav')) closeMenu();
});
window.matchMedia('(min-width: 821px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// Interactive Event Format Tabs with 3D / Smooth Transition
const events = {
  wedding: {
    image:'dance.jpg',
    alt:'Casal celebrando seu casamento na pista de dança do Imperador Eventos',
    caption:'CASAMENTOS AO AR LIVRE E NO SALÃO COBERTO',
    highlight:'1 evento por dia · Suíte dos noivos incluída',
    description:'Realize a cerimônia na área externa ao lado da piscina iluminada ou nos jardins e receba até 400 a 500 convidados no salão coberto. Conta com quarto reservado para os noivos e dormitórios para familiares.',
    cta:'Consultar disponibilidade para casamento'
  },
  birthday: {
    image:'celebration.jpg',
    alt:'Decoração de festa de 15 anos realizada no Imperador Eventos em Betim',
    caption:'PRODUÇÕES DE 15 ANOS E ANIVERSÁRIOS',
    highlight:'Salão envidraçado + boate ao lado da piscina',
    description:'Amplo salão coberto para grandes montagens cenográficas, quarto de apoio exclusivo para troca de figurino da debutante e boate dedicada ao lado da piscina para a pista de dança.',
    cta:'Consultar disponibilidade para festa'
  },
  together: {
    image:'pool-day.jpg',
    alt:'Vista diurna da piscina com cascata do Sítio Imperador em Betim',
    caption:'ENCONTROS EM FAMÍLIA E DIAS DE SOL',
    highlight:'Piscina com cascata · Campo society · 30 camas',
    description:'Aproveite finais de semana e feriados em família com piscina com cascata, área de churrasqueira, campo de futebol society e dois alojamentos equipados com 30 camas para hospedagem.',
    cta:'Consultar disponibilidade para família'
  },
  corporate: {
    image:'hall.jpg',
    alt:'Salão de festas coberto e palco do Imperador Eventos em Betim',
    caption:'CONFRATERNIZAÇÕES E EVENTOS CORPORATIVOS',
    highlight:'Estacionamento interno · Acesso fácil em Betim',
    description:'Localizado em Bandeirinhas, Betim, o espaço oferece salão coberto com palco, cozinha de apoio para buffet, área de lazer completa e estacionamento interno para confraternizações de empresas e palestras.',
    cta:'Consultar disponibilidade corporativa'
  }
};

const tabs = [...document.querySelectorAll('.event-tab')];
function activateEvent(tab) {
  const event = events[tab.dataset.event];
  if (!event) return;
  tabs.forEach(item => {
    const selected = item === tab;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  const image = document.querySelector('#event-image');
  const panel = document.querySelector('#event-panel');
  image.src = `/assets/${event.image}`;
  image.alt = event.alt;
  document.querySelector('#event-caption').textContent = event.caption;
  const highlightEl = document.querySelector('#event-highlight');
  if (highlightEl) highlightEl.textContent = event.highlight;
  document.querySelector('#event-description').textContent = event.description;
  document.querySelector('#event-contact').firstChild.textContent = event.cta + ' ';
  panel.setAttribute('aria-labelledby', tab.id);

  if (image.animate) {
    image.animate(
      [
        { opacity: 0.25, transform: 'scale(1.1) translate3d(0, 12px, 0)', filter: 'blur(6px)' },
        { opacity: 1, transform: 'scale(1.05) translate3d(0, 0, 0)', filter: 'blur(0px)' }
      ],
      { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
  }
  if (panel.animate) {
    panel.animate(
      [
        { opacity: 0, transform: 'translate3d(0, 14px, 0)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ],
      { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
  }
  measureMotion();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateEvent(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      activateEvent(tabs[next]);
      tabs[next].focus();
    }
  });
});

// Accessible Lightbox Gallery
const lightbox = document.querySelector('#lightbox');
const photos = [...document.querySelectorAll('[data-photo]')];
let photoIndex = 0;
let photoOpener;
function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const item = photos[photoIndex];
  const imgEl = document.querySelector('#lightbox-image');
  imgEl.src = item.dataset.photo;
  imgEl.alt = item.dataset.caption;
  document.querySelector('#lightbox-caption').textContent = item.dataset.caption;
  document.querySelector('#photo-count').textContent = `${photoIndex + 1} / ${photos.length}`;
  if (imgEl.animate) {
    imgEl.animate(
      [
        { opacity: 0.3, transform: 'scale(0.95)' },
        { opacity: 1, transform: 'scale(1)' }
      ],
      { duration: 380, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
  }
}

photos.forEach((photo, index) => {
  photo.addEventListener('click', () => {
    photoOpener = photo;
    showPhoto(index);
    lenis?.stop();
    document.body.classList.add('modal-open');
    lightbox.showModal();
  });
});

document.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
document.querySelector('#photo-prev')?.addEventListener('click', () => showPhoto(photoIndex - 1));
document.querySelector('#photo-next')?.addEventListener('click', () => showPhoto(photoIndex + 1));
lightbox?.addEventListener('click', event => {
  if (event.target !== lightbox) return;
  const rect = lightbox.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  ) {
    lightbox.close();
  }
});
lightbox?.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    showPhoto(photoIndex - 1);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(photoIndex + 1);
  }
});
lightbox?.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  lenis?.start();
  photoOpener?.focus({ preventScroll: true });
});

document.querySelectorAll('.faq details').forEach(detail => {
  detail.addEventListener('toggle', measureMotion);
});

const contactSection = document.querySelector('#contato');
if (contactSection && floatingContact) {
  new IntersectionObserver(
    entries => {
      const hidden = entries[0].isIntersecting;
      floatingContact.classList.toggle('is-hidden', hidden);
      floatingContact.tabIndex = hidden ? -1 : 0;
      floatingContact.setAttribute('aria-hidden', String(hidden));
    },
    { threshold: 0.12 }
  ).observe(contactSection);
}

const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Verify and bind public business details from /business.json
fetch('/business.json')
  .then(response => (response.ok ? response.json() : null))
  .then(business => {
    if (!business) return;
    if (business.whatsapp && /^\d{10,15}$/.test(String(business.whatsapp))) {
      const href = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent('Olá! Conheci o Sítio Imperador em Betim pelo site e gostaria de consultar disponibilidade de data e agendar uma visita.')}`;
      const mainBtn = document.querySelector('#contact-main');
      if (mainBtn) {
        mainBtn.href = href;
        mainBtn.firstChild.textContent = 'Conversar no WhatsApp ';
      }
      const captionEl = document.querySelector('#contact-caption');
      if (captionEl && business.phoneDisplay) {
        captionEl.textContent = `Atendimento Betim, MG · WhatsApp: ${business.phoneDisplay} · Alameda dos Varjões, 51 - Bandeirinhas`;
      }
      if (floatingContact) {
        floatingContact.href = href;
        floatingContact.target = '_blank';
        floatingContact.rel = 'noopener noreferrer';
      }
    }
    if (business.instagram && String(business.instagram).startsWith('https://www.instagram.com/')) {
      const socialLink = document.querySelector('#social-link');
      if (socialLink) {
        socialLink.href = business.instagram;
        socialLink.textContent = 'Instagram @imperadoreventos ↗';
      }
      const socialCta = document.querySelector('#social-cta');
      if (socialCta) {
        socialCta.href = business.instagram;
      }
    }
  })
  .catch(() => {});
