import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function isLinkValue(value) {
  return /^(#|\/|https?:\/\/|mailto:|tel:)/.test(value);
}

function linkOnlyParagraph(element) {
  const link = element?.querySelector(':scope > a[href]');
  const text = element?.textContent.trim();

  if (link && text === link.textContent.trim()) {
    return {
      href: link.getAttribute('href'),
      label: link.textContent.trim(),
    };
  }

  if (text && isLinkValue(text)) {
    return {
      href: text,
      label: text,
    };
  }

  return null;
}

function decorateCardBody(body) {
  const paragraphs = [...body.querySelectorAll(':scope > p')]
    .filter((paragraph) => paragraph.textContent.trim());
  const cardLink = linkOnlyParagraph(paragraphs[paragraphs.length - 1]);

  if (cardLink) {
    body.dataset.cardHref = cardLink.href;
    body.dataset.cardLabel = cardLink.label;
    paragraphs[paragraphs.length - 1].remove();
    paragraphs.pop();
  }

  paragraphs[0]?.classList.add('cards-card-eyebrow');
  paragraphs[1]?.classList.add('cards-card-title');
  paragraphs[2]?.classList.add('cards-card-description');
}

function makeCardLink(card) {
  const body = card.querySelector('.cards-card-body[data-card-href]');
  if (!body) return;

  const link = document.createElement('a');
  link.className = 'cards-card-link';
  link.href = body.dataset.cardHref;
  link.setAttribute('aria-label', body.dataset.cardLabel || card.querySelector('.cards-card-title')?.textContent.trim() || 'Read more');
  moveInstrumentation(body, link);

  if (!body.children.length) body.remove();

  while (card.firstElementChild) link.append(card.firstElementChild);
  card.append(link);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else {
        div.className = 'cards-card-body';
        decorateCardBody(div);
      }
    });
    makeCardLink(li);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
