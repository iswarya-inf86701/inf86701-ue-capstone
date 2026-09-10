/**
 * Decorates the custom button block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children].map((row) => row.firstElementChild || row);
  const [labelCell, linkCell, variantCell, ariaLabelCell] = rows;
  const label = labelCell?.textContent.trim() || 'Learn More';
  const authoredLink = linkCell?.querySelector('a[href]');
  const href = authoredLink?.getAttribute('href') || linkCell?.textContent.trim() || '#';
  const variant = variantCell?.textContent.trim().toLowerCase() || 'default';
  const ariaLabel = ariaLabelCell?.textContent.trim();
  const buttonType = ['primary', 'secondary'].includes(variant) ? variant : 'default';

  const wrapper = document.createElement('p');
  wrapper.className = 'custom-button-wrapper';

  const link = document.createElement('a');
  link.className = `custom-button-link ${buttonType}`;
  link.href = href;
  link.textContent = label;
  if (ariaLabel) link.setAttribute('aria-label', ariaLabel);

  wrapper.append(link);
  block.replaceChildren(wrapper);
}
