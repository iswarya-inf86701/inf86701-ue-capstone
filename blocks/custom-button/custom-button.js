/**
 * Decorates the custom button block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children].map((row) => row.firstElementChild || row);
  const [labelCell, linkCell, variantCell] = rows;
  const label = labelCell?.textContent.trim() || 'Custom Button';
  const authoredLink = linkCell?.querySelector('a[href]');
  const href = authoredLink?.getAttribute('href') || linkCell?.textContent.trim() || '#';
  const variant = variantCell?.textContent.trim().toLowerCase() || 'default';
  const buttonType = ['primary', 'secondary', 'outline'].includes(variant) ? variant : 'default';

  const wrapper = document.createElement('p');
  wrapper.className = 'custom-button-wrapper';

  const link = document.createElement('a');
  link.className = `custom-button-link ${buttonType}`;
  link.href = href;
  link.textContent = label;

  wrapper.append(link);
  block.replaceChildren(wrapper);
}
