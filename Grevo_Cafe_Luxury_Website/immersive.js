/* Native scroll, no scroll hijacking or animation dependencies. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const room = document.querySelector('.cafe-world');
  if (!room) return;
  const frames = [...room.querySelectorAll('.world-frame')];
  const stage = room.querySelector('.world-stage');
  const floating = [...document.querySelectorAll('.floating-photo')];
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let pointerX = 0;
  let pointerY = 0;
  let scheduled = false;
  const clamp = n => Math.max(0, Math.min(1, n));
  function render() {
    scheduled = false;
    if (preference.matches) return;
    const rect = room.getBoundingClientRect();
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const progress = clamp((top - rect.top) / Math.max(1, rect.height - stage.offsetHeight));
    const mobile = innerWidth <= 680;
    const travel = progress - .35;
    room.style.setProperty('--room-progress', progress);
    room.style.setProperty('--room-zoom', 1 + progress * .18);
    room.style.setProperty('--room-heading-opacity', 1 - clamp((progress - .53) * 2.2));
    room.style.setProperty('--room-heading-y', `${-progress * 45}px`);
    room.style.setProperty('--dust-y', `${-progress * 85}px`);
    room.style.setProperty('--look-x', `${-pointerY * 1.5}deg`);
    room.style.setProperty('--look-y', `${pointerX * 2}deg`);
    const active = rect.bottom > 0 && rect.top < innerHeight;
    if (active) frames.forEach((frame, index) => {
      const depth = Number(frame.dataset.depth);
      const side = index === 0 ? -1 : index === 2 ? -.15 : 1;
      const x = side * travel * (mobile ? 35 : 120) * depth + pointerX * depth * 18;
      const y = -travel * (mobile ? 85 : 155) * depth + pointerY * depth * 14;
      const z = travel * (mobile ? 110 : 230) * depth;
      const angle = [-5, 5, -4, 8][index];
      const yaw = [15, -18, 4, -15][index] * (1 - progress * .65);
      frame.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${yaw}deg) rotateZ(${angle + travel * side * 4}deg)`;
    });
    floating.forEach((photo, index) => {
      const depth = index ? 1.5 : 1;
      photo.style.setProperty('--float-x', `${pointerX * depth * 16}px`);
      photo.style.setProperty('--float-y', `${pointerY * depth * 12 - scrollY * .025 * depth}px`);
      photo.style.setProperty('--float-rotate', `${pointerX * 7}deg`);
    });
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(render); }
  }
  function syncPreference() {
    document.documentElement.classList.toggle('room-enabled', !preference.matches);
    if (preference.matches) frames.forEach(frame => frame.style.removeProperty('transform'));
    schedule();
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  window.addEventListener('pointermove', event => {
    if (!finePointer.matches || preference.matches) return;
    pointerX = (event.clientX / innerWidth - .5) * 2;
    pointerY = (event.clientY / innerHeight - .5) * 2;
    schedule();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    pointerX = pointerY = 0;
    schedule();
  });
  preference.addEventListener('change', syncPreference);
  syncPreference();
})();
