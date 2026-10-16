// User-supplied photos enhance the existing design once the files are present.
// Keep the current images if a supplied file has not been copied into assets yet.
(() => {
  const assignments = [
    {
      file: 'assets/grevo-entrance.jpg',
      variable: '--entrance-photo',
      images: ['.visit-photo img'],
      alt: 'Grevo Cafe entrance at night, framed by flowers and warm lights'
    },
    {
      file: 'assets/grevo-latte.jpg',
      variable: '--coffee-photo',
      images: ['.floating-photo-detail img', '.frame-counter img'],
      alt: 'Heart-shaped latte art in a ceramic cup on a warm wooden table',
      loaded() {
        const caption = document.querySelector('.frame-counter figcaption');
        if (caption) caption.innerHTML = '<span>02 / THE DAILY RITUAL</span><em>Your first perfect sip.</em>';
      }
    },
    {
      file: 'assets/grevo-night-sign.jpg',
      variable: '--night-sign-photo',
      images: ['.frame-mark img', '.gallery-grid figure:last-child img'],
      alt: 'Illuminated Grevo Cafe sign beside a vintage lantern at night',
      loaded() {
        const caption = document.querySelector('.gallery-grid figure:last-child figcaption');
        if (caption) caption.textContent = '03 — Follow the golden glow';
      }
    }
  ];
  assignments.forEach(assignment => {
    const photo = new Image();
    photo.onload = () => {
      document.documentElement.style.setProperty(assignment.variable, `url("${assignment.file}")`);
      assignment.images.forEach(selector => {
        document.querySelectorAll(selector).forEach(image => {
          image.src = assignment.file;
          image.alt = assignment.alt;
        });
      });
      if (assignment.loaded) assignment.loaded();
      if (assignment.variable === '--entrance-photo') document.documentElement.classList.add('has-entrance-photo');
    };
    photo.src = assignment.file;
  });
})();
