/**
 * decorate the block
 * @param {Element} block the block
 */
export default function decorate(block) {
  const items = [];

  [...block.children].forEach((row) => {
    const [titleCell, contentCell] = row.children;
    const title = titleCell?.textContent.trim();
    const hasContent = contentCell
      && (contentCell.textContent.trim() || contentCell.querySelector('img, picture'));
    if (!title || !hasContent) return;

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = title;
    const body = document.createElement('div');
    body.className = 'accordion-content';
    body.append(...contentCell.childNodes);
    details.append(summary, body);
    items.push(details);
  });

  block.replaceChildren(...items);

  if (block.classList.contains('open-first') && items.length) items[0].open = true;

  if (block.classList.contains('single')) {
    items.forEach((details) => {
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        items.forEach((other) => {
          if (other !== details) other.open = false;
        });
      });
    });
  }
}
