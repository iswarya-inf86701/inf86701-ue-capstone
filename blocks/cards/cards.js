import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function isLinkValue(value) {
  return /^(#|\/|https?:\/\/|mailto:|tel:)/.test(value);
}

function linkOnlyElement(element) {
  const link = element?.querySelector('a[href]');
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

function moveCellContent(cell, className) {
  const content = cell.children.length === 1 && cell.firstElementChild
    ? cell.firstElementChild
    : document.createElement('p');

  if (!content.parentElement) {
    while (cell.firstChild) content.append(cell.firstChild);
  }

  content.classList.add(className);
  moveInstrumentation(cell, content);
  return content;
}

function hasContent(element) {
  return element.textContent.trim() || element.querySelector('a[href], picture');
}

function decorateStructuredCardBodies(card, textOnly = false) {
  const bodyCells = [...card.querySelectorAll(':scope > .cards-card-body')];
  const contentCells = bodyCells.filter(hasContent);
  bodyCells.filter((cell) => !hasContent(cell)).forEach((cell) => cell.remove());

  const cardLink = linkOnlyElement(contentCells[contentCells.length - 1]);
  if (cardLink) {
    contentCells[contentCells.length - 1].remove();
    contentCells.pop();
  }

  const body = document.createElement('div');
  body.className = 'cards-card-body';
  if (cardLink) {
    body.dataset.cardHref = cardLink.href;
    body.dataset.cardLabel = cardLink.label;
  }

  const fields = textOnly ? [
    [contentCells[0], 'cards-card-title'],
    [contentCells[1], 'cards-card-description'],
  ] : [
    [contentCells[0], 'cards-card-eyebrow'],
    [contentCells[1], 'cards-card-title'],
    [contentCells[2], 'cards-card-description'],
  ];

  fields.forEach(([cell, className]) => {
    if (!cell) return;
    body.append(moveCellContent(cell, className));
    cell.remove();
  });

  contentCells.slice(textOnly ? 2 : 3).forEach((cell) => {
    while (cell.firstChild) body.append(cell.firstChild);
    cell.remove();
  });
  card.append(body);
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
  const textOnly = block.closest('.section.season-cards');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    decorateStructuredCardBodies(li, textOnly);
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
