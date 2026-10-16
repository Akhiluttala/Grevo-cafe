const button=document.querySelector('.hamburger');const nav=document.querySelector('.nav');if(button&&nav){button.addEventListener('click',()=>{const open=nav.classList.toggle('open');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close navigation':'Toggle navigation');button.textContent=open?'×':'☰'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');button.setAttribute('aria-expanded','false');button.textContent='☰'}))}document.getElementById('year').textContent=new Date().getFullYear();
// Reveal once, and keep all content visible if motion is reduced or unsupported.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const revealTargets = document.querySelectorAll('.story-copy, .story-photo, .section-heading, .menu-card, .quote p, .quote small, .gallery-grid figure, .visit-copy, .footer-tag');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(element => {
    element.classList.add('reveal');
    if (element.matches('.menu-card, .gallery-grid figure')) {
      element.style.setProperty('--reveal-delay', `${Array.from(element.parentElement.children).indexOf(element) * 120}ms`);
    }
    revealObserver.observe(element);
  });
  document.documentElement.classList.add('motion-ready');
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) document.documentElement.classList.remove('motion-ready');
  });
}
const header = document.querySelector('.header');
let scrollQueued = false;
function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 24);
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) {
    scrollQueued = true;
    requestAnimationFrame(updateHeader);
  }
}, { passive: true });
updateHeader();

// Progressive enhancement: native scrolling drives a walk through the cafe.
if (!motionPreference.matches) {
  const hero = document.querySelector('.hero');
  const journey = document.createElement('div');
  journey.className = 'walkthrough';
  hero.before(journey);
  journey.append(hero);
  const entrance = document.createElement('div');
  entrance.className = 'entrance';
  entrance.setAttribute('aria-hidden', 'true');
  entrance.innerHTML = '<div class="entrance-door door-left"></div><div class="entrance-door door-right"></div>';
  const title = document.createElement('div');
  title.className = 'entrance-title';
  title.setAttribute('aria-hidden', 'true');
  title.innerHTML = '<small>LEAVE THE EVERYDAY AT THE DOOR</small><strong>GREVO</strong><em>A little world. Waiting for you.</em>';
  const cue = document.createElement('div');
  cue.className = 'entrance-scroll';
  cue.setAttribute('aria-hidden', 'true');
  cue.innerHTML = 'SCROLL TO STEP INSIDE<span></span>';
  hero.append(entrance, title, cue);
  const rail = document.createElement('nav');
  rail.className = 'journey-rail';
  rail.setAttribute('aria-label', 'Your cafe journey');
  const stops = [['home', 'ARRIVE'], ['story', 'STEP INSIDE'], ['menu', 'SAVOUR'], ['gallery', 'LOOK AROUND'], ['visit', 'YOUR TABLE']];
  rail.innerHTML = stops.map(([id, label]) => `<a href="#${id}" aria-label="${label}"><span>${label}</span></a>`).join('');
  document.body.append(rail);
  document.documentElement.classList.add('walk-enabled');
  const clamp = value => Math.max(0, Math.min(1, value));
  const story = document.querySelector('.story');
  const menu = document.querySelector('.menu-section');
  const gallery = document.querySelector('.gallery');
  const quote = document.querySelector('.quote');
  const visit = document.querySelector('.visit');
  const sections = stops.map(([id]) => document.getElementById(id));
  let framePending = false;
  function renderJourney() {
    framePending = false;
    if (motionPreference.matches) return;
    const height = window.innerHeight;
    const rect = journey.getBoundingClientRect();
    const offset = header?.offsetHeight || 0;
    const progress = clamp((offset - rect.top) / Math.max(1, rect.height - height + offset));
    const opening = clamp(progress / .65);
    const eased = opening * opening * (3 - 2 * opening);
    hero.style.setProperty('--door-left', `${-eased * 105}deg`);
    hero.style.setProperty('--door-right', `${eased * 105}deg`);
    hero.style.setProperty('--entrance-opacity', 1 - clamp((progress - .58) / .16));
    hero.style.setProperty('--title-opacity', 1 - clamp(progress / .26));
    hero.style.setProperty('--title-scale', 1 + progress * .5);
    hero.style.setProperty('--camera-scale', 1.02 + eased * .25);
    hero.style.setProperty('--welcome-opacity', clamp((progress - .32) / .28));
    hero.style.setProperty('--welcome-y', `${(1 - clamp((progress - .32) / .4)) * 45}px`);
    const sceneProgress = element => clamp((height - element.getBoundingClientRect().top) / (height + element.offsetHeight));
    const sp = sceneProgress(story);
    story.style.setProperty('--image-drift', `${(sp - .5) * -65}px`);
    story.style.setProperty('--image-inset', `${(1 - clamp(sp * 2.8)) * 24}%`);
    const mp = sceneProgress(menu);
    menu.style.setProperty('--plate-tilt', `${(1 - clamp(mp * 2.5)) * 18}deg`);
    menu.style.setProperty('--plate-rise', `${(1 - clamp(mp * 2.5)) * 65}px`);
    gallery.querySelectorAll('figure').forEach((figure, index) => {
      figure.style.setProperty('--gallery-drift', `${(sceneProgress(figure) - .5) * (index % 2 ? 65 : -65)}px`);
    });
    quote.style.setProperty('--quote-fill', `${clamp((sceneProgress(quote) - .1) * 1.8) * 100}%`);
    visit.style.setProperty('--visit-scale', 1.2 - sceneProgress(visit) * .2);
    let active = 0;
    sections.forEach((section, index) => { if (section.getBoundingClientRect().top < height * .55) active = index; });
    rail.querySelectorAll('a').forEach((link, index) => {
      link.classList.toggle('active', index === active);
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleJourney() {
    if (!framePending) { framePending = true; requestAnimationFrame(renderJourney); }
  }
  window.addEventListener('scroll', scheduleJourney, { passive: true });
  window.addEventListener('resize', scheduleJourney);
  window.addEventListener('load', scheduleJourney);
  motionPreference.addEventListener('change', scheduleJourney);
  renderJourney();
}
