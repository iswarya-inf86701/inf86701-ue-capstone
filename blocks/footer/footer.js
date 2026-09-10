import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const brandColumn = footer.querySelector('.section:first-child .columns > div > div:first-child');
  const brandImage = brandColumn?.querySelector('picture, img');
  const brandHeading = brandColumn?.querySelector('h1, h2, h3, h4, h5, h6');
  if (brandImage && brandHeading) {
    const brand = document.createElement('div');
    brand.className = 'footer-brand';
    brand.append(brandImage, brandHeading);
    brandColumn.prepend(brand);
  }

  block.append(footer);
}
