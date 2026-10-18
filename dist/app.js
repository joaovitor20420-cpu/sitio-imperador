const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis;
let motionFrame = 0;
let revealObserver;
let floatMeasurements = [];
const heroImage = document.querySelector('.hero-image');
const floatItems = [...document.querySelectorAll('[data-float], [data-parallax]')];
const floatingContact = document.querySelector('.floating-contact');

function measureMotion() {
  floatMeasurements = floatItems.map(el => {
    const rect = el.parentElement.getBoundingClientRect();
    return { el, top: rect.top + window.scrollY, height: rect.height, amount: Number(el.dataset.float || 24) };
  });
  requestMotion();
}
function renderMotion() {
  motionFrame = 0;
  if (reduceMotion.matches || document.hidden) return;
  const y = window.scrollY;
  const height = window.innerHeight;
  if (y < height * 1.3) heroImage.style.transform = `translateY(calc(-3% + ${Math.min(y * .13, 95)}px))`;
  for (const item of floatMeasurements) {
    if (item.top > y + height + 180 || item.top + item.height < y - 180) continue;
    const progress = Math.max(-1, Math.min(1, (y + height / 2 - item.top - item.height / 2) / height));
    item.el.style.transform = item.el.hasAttribute('data-float')
      ? `translate3d(0, ${progress * item.amount}px, 0) rotate(${progress * 2}deg)`
      : `translate3d(0, ${progress * 24 - 16}px, 0)`;
  }
}
function requestMotion() { if (!motionFrame && !reduceMotion.matches) motionFrame = requestAnimationFrame(renderMotion); }
function setupMotion() {
  lenis?.destroy();
  lenis = undefined;
  revealObserver?.disconnect();
  document.documentElement.classList.toggle('js-motion', !reduceMotion.matches);
  if (reduceMotion.matches) {
    cancelAnimationFrame(motionFrame); motionFrame = 0;
    [...floatItems,heroImage].forEach(el => el.style.removeProperty('transform'));
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }
  if (window.Lenis) lenis = new Lenis({autoRaf:true,lerp:.085,smoothWheel:true,syncTouch:false,anchors:{offset:-28},allowNestedScroll:true});
  revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), {threshold:.08, rootMargin:'0px 0px -25px 0px'});
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  measureMotion();
}
setupMotion();
reduceMotion.addEventListener('change', setupMotion);
window.addEventListener('scroll', requestMotion, {passive:true});
let resizeFrame;
window.addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(measureMotion); }, {passive:true});
window.addEventListener('load', measureMotion);
document.fonts?.ready.then(measureMotion);
document.addEventListener('visibilitychange', () => { if (document.hidden) lenis?.stop(); else { if (!document.querySelector('dialog[open]')) lenis?.start(); requestMotion(); } });

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function closeMenu() { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Abrir menu'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open ? 'Fechar menu' : 'Abrir menu');
});
mobileNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) {closeMenu();menuButton.focus();} });
document.addEventListener('click', event => { if (!event.target.closest('.site-header, .mobile-nav')) closeMenu(); });
window.matchMedia('(min-width: 801px)').addEventListener('change', event => {if(event.matches) closeMenu();});

const events = {
  wedding: {image:'dance.jpg',alt:'Casal celebrando seu casamento no Imperador Eventos',caption:'UM CENÁRIO PARA O SEU SIM',description:'Um novo começo merece um cenário especial. Imagine a cerimônia, os abraços e a festa em um só lugar, com a natureza fazendo parte da história.',cta:'Vamos imaginar esse dia?'},
  birthday: {image:'celebration.jpg',alt:'Decoração de celebração no Imperador Eventos',caption:'PARA COMEMORAR UMA NOVA FASE',description:'Tem idade que merece uma festa. Dos aniversários aos tão sonhados 15 anos, encontre inspiração para reunir sua turma e celebrar do seu jeito.',cta:'Vamos planejar sua festa?'},
  together: {image:'pool.jpg',alt:'Área de piscina e convivência do Imperador Eventos',caption:'QUANDO ESTAR JUNTO É O MELHOR PLANO',description:'Uma pausa na rotina para criar novas lembranças. Imagine um encontro de família ou uma confraternização com piscina, verde e tempo para conversar.',cta:'Vamos reunir sua turma?'}
};
const tabs = [...document.querySelectorAll('.event-tab')];
function activateEvent(tab) {
  const event = events[tab.dataset.event];
  tabs.forEach(item => {const selected = item === tab; item.classList.toggle('active',selected);item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;});
  const image = document.querySelector('#event-image');
  image.src = `/assets/${event.image}`;image.alt = event.alt;
  document.querySelector('#event-caption').textContent = event.caption;
  document.querySelector('#event-description').textContent = event.description;
  document.querySelector('#event-contact').firstChild.textContent = event.cta + ' ';
  document.querySelector('#event-panel').setAttribute('aria-labelledby',tab.id);
  if (!reduceMotion.matches) image.animate([{opacity:.5,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)'});
  measureMotion();
}
tabs.forEach((tab,index) => {
  tab.addEventListener('click', () => activateEvent(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {event.preventDefault();activateEvent(tabs[next]);tabs[next].focus();}
  });
});

const lightbox = document.querySelector('#lightbox');
const photos = [...document.querySelectorAll('[data-photo]')];
let photoIndex = 0;
let photoOpener;
function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const item = photos[photoIndex];
  document.querySelector('#lightbox-image').src = item.dataset.photo;
  document.querySelector('#lightbox-image').alt = item.dataset.caption;
  document.querySelector('#lightbox-caption').textContent = item.dataset.caption;
  document.querySelector('#photo-count').textContent = `${photoIndex + 1} / ${photos.length}`;
}
photos.forEach((photo,index) => photo.addEventListener('click', () => {
  photoOpener = photo;showPhoto(index);lenis?.stop();document.body.classList.add('modal-open');lightbox.showModal();
}));
document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
document.querySelector('#photo-prev').addEventListener('click', () => showPhoto(photoIndex-1));
document.querySelector('#photo-next').addEventListener('click', () => showPhoto(photoIndex+1));
lightbox.addEventListener('click', event => {
  if (event.target !== lightbox) return;
  const rect = lightbox.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close();
});
lightbox.addEventListener('keydown', event => {if(event.key === 'ArrowLeft'){event.preventDefault();showPhoto(photoIndex-1);}if(event.key === 'ArrowRight'){event.preventDefault();showPhoto(photoIndex+1);}});
lightbox.addEventListener('close', () => {document.body.classList.remove('modal-open');lenis?.start();photoOpener?.focus({preventScroll:true});});
document.querySelectorAll('.faq details').forEach(detail => detail.addEventListener('toggle', measureMotion));
new IntersectionObserver(entries => {
  const hidden = entries[0].isIntersecting;
  floatingContact.classList.toggle('is-hidden',hidden);
  floatingContact.tabIndex = hidden ? -1 : 0;
  floatingContact.setAttribute('aria-hidden',String(hidden));
}, {threshold:.12}).observe(document.querySelector('#contato'));
document.querySelector('#year').textContent = new Date().getFullYear();

// Public contact details are configured only after source verification.
fetch('/business.json').then(response => response.ok ? response.json() : null).then(business => {
  if (!business) return;
  if (business.whatsapp) {
    const href = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent('Olá! Conheci o Sítio Imperador e gostaria de saber mais sobre disponibilidade e agendar uma visita.')}`;
    document.querySelector('#contact-main').href = href;
    document.querySelector('#contact-main').firstChild.textContent = 'Vamos conversar no WhatsApp ';
    document.querySelector('#contact-caption').textContent = business.phoneDisplay;
    floatingContact.href = href;floatingContact.target = '_blank';floatingContact.rel = 'noopener noreferrer';
  }
  if (business.instagram) {document.querySelector('#social-link').href = business.instagram;document.querySelector('#social-link').textContent = 'Instagram ↗';}
}).catch(() => {});
