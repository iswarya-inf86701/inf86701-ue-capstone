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

  const textBlocks = [...content.querySelectorAll(':scope > p:not(.hero-eyebrow, .button-wrapper)')];
  const hasHeading = content.querySelector('h1, h2');
  if (!hasHeading && textBlocks[0]) textBlocks[0].classList.add('hero-title');
  const description = hasHeading ? textBlocks[0] : textBlocks[1];
  if (description) description.classList.add('hero-description');

  const actionItems = textBlocks
    .filter((item) => !item.classList.contains('hero-title') && !item.classList.contains('hero-description'))
    .filter((item) => item.querySelector('a') || item.textContent.trim().length <= 40);
  actionItems.forEach((item) => item.classList.add('hero-action'));

  if (content.children.length) block.append(content);
}
