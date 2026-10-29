import { createOptimizedPicture } from '../../scripts/aem.js';

const DUMMY_IMAGE = 'https://placehold.co/800x450?text=No+Image';

export default function decorate(block) {
  const slides = [];

  [...block.children].forEach((row) => {
    const cols = [...row.children];
    const imageCol = cols[0];
    const titleCol = cols[1];
    const descCol = cols[2];

    // Handle image
    let picture = imageCol ? imageCol.querySelector('picture') : null;
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        picture = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '800' }]);
      }
    } else {
      // Use dummy image if none provided
      picture = document.createElement('img');
      picture.src = DUMMY_IMAGE;
      picture.alt = 'Placeholder image';
      picture.loading = 'lazy';
    }

    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'carousel-slide-image';
    imgWrapper.append(picture);

    const content = document.createElement('div');
    content.className = 'carousel-slide-content';

    if (titleCol) {
      const titleEl = document.createElement('div');
      titleEl.className = 'carousel-slide-title';
      titleEl.innerHTML = titleCol.innerHTML;
      content.append(titleEl);
    }

    if (descCol) {
      const descEl = document.createElement('div');
      descEl.className = 'carousel-slide-description';
      descEl.innerHTML = descCol.innerHTML;
      content.append(descEl);
    }

    slide.append(imgWrapper);
    slide.append(content);
    slides.push(slide);
  });

  // Build carousel structure
  const carousel = document.createElement('div');
  carousel.className = 'carousel-container';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  slides.forEach((slide) => track.append(slide));

  // Prev / Next buttons
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-btn carousel-btn-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '&#8249;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-btn carousel-btn-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '&#8250;';

  // Bubble indicators
  const bubbles = document.createElement('div');
  bubbles.className = 'carousel-bubbles';
  slides.forEach((_, i) => {
    const bubble = document.createElement('button');
    bubble.className = 'carousel-bubble';
    bubble.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) bubble.classList.add('active');
    bubble.addEventListener('click', () => goToSlide(i));
    bubbles.append(bubble);
  });

  carousel.append(prevBtn);
  carousel.append(track);
  carousel.append(nextBtn);

  block.replaceChildren(carousel);
  block.append(bubbles);

  let current = 0;
  const total = slides.length;

  function updateSlides() {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
    });
    [...bubbles.children].forEach((b, i) => {
      b.classList.toggle('active', i === current);
    });
    track.style.transform = `translateX(-${current * 100}%)`;
  }

  function goToSlide(index) {
    current = (index + total) % total;
    updateSlides();
  }

  prevBtn.addEventListener('click', () => goToSlide(current - 1));
  nextBtn.addEventListener('click', () => goToSlide(current + 1));

  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide(current - 1);
    if (e.key === 'ArrowRight') goToSlide(current + 1);
  });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0 ? current + 1 : current - 1);
    }
  }, { passive: true });

  // Initialize
  updateSlides();
}
