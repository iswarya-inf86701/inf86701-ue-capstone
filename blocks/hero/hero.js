import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function isLinkValue(value) {
  return /^(#|\/|https?:\/\/|mailto:|tel:)/.test(value);
}

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

  const authoredText = [...content.querySelectorAll('p:not(.button-wrapper)')]
    .filter((item) => item.textContent.trim());

  const eyebrow = authoredText[0];
  if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('hero-eyebrow');

  const textBlocks = authoredText.filter((item) => !item.classList.contains('hero-eyebrow'));
  const hasHeading = content.querySelector('h1, h2');
  if (!hasHeading && textBlocks[0]) textBlocks[0].classList.add('hero-title');
  const description = hasHeading ? textBlocks[0] : textBlocks[1];
  if (description) description.classList.add('hero-description');

  const actionItems = textBlocks.filter((item) => (
    !item.classList.contains('hero-title')
    && !item.classList.contains('hero-description')
  ));
  const actions = document.createElement('div');
  actions.className = 'hero-actions';

  actionItems.forEach((item, index) => {
    const text = item.textContent.trim();
    const nextItem = actionItems[index + 1];
    const nextLink = nextItem?.querySelector('a');
    const nextText = nextItem?.textContent.trim();

    if (isLinkValue(text)) {
      item.remove();
      return;
    }

    if (nextText && isLinkValue(nextText)) {
      const action = document.createElement('a');
      action.className = 'hero-action';
      action.href = nextLink?.getAttribute('href') || nextText;
      action.textContent = text;
      moveInstrumentation(item, action);
      actions.append(action);
      item.remove();
      nextItem.remove();
    }
  });

  actionItems.forEach((item) => {
    if (isLinkValue(item.textContent.trim())) item.remove();
  });

  if (actions.children.length) content.append(actions);

  if (content.children.length) block.append(content);
}
