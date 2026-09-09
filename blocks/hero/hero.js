import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const picture = block.querySelector('picture');
  if (picture) {
    const image = picture.querySelector('img');
    const media = document.createElement('div');
    media.className = 'hero-media';

    if (image) {
      const optimizedPicture = createOptimizedPicture(image.src, image.alt, false, [{ width: '2000' }]);
      moveInstrumentation(image, optimizedPicture.querySelector('img'));
      media.append(optimizedPicture);
    } else {
      media.append(picture);
    }

    const imageRow = picture.closest(':scope > div') || picture.closest('div');
    if (imageRow) imageRow.remove();
    block.prepend(media);
  }

  const content = document.createElement('div');
  content.className = 'hero-content';
  [...block.children].forEach((row) => {
    if (row.classList.contains('hero-media')) return;
    moveInstrumentation(row, content);
    while (row.firstElementChild) content.append(row.firstElementChild);
    row.remove();
  });

  const eyebrow = content.querySelector('p:not(.button-wrapper)');
  if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('hero-eyebrow');
  if (content.children.length) block.append(content);
}
