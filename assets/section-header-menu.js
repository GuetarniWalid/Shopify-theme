class HeaderMenuSection extends HTMLElement {
  menuHeader;

  constructor() {
    super();
    this.menuHeader = this.querySelector('.header_menu');
  }

  connectedCallback() {
    Shopify.addListener(document.body, 'openHeaderMenu', this.expandMenu.bind(this));
    Shopify.addListener(document.body, 'closeHeaderMenu', this.closeMenu.bind(this));
  }

  expandMenu() {
    document.body.style.overflowY = 'hidden';
    this.menuHeader.classList.replace('header_menu_hidden', 'header_menu_visible');
  }

  closeMenu() {
    document.body.style.overflow = 'auto';
    this.menuHeader.classList.replace('header_menu_visible', 'header_menu_hidden');
  }
}

customElements.define('header-menu-section', HeaderMenuSection);

//Part specific to Shopify Editor
let editorOpen = false;

Shopify.addListener(document.body, 'shopify:section:select', e => {
  if (e.detail.sectionId !== 'header-menu') return;
  const menuHeader = e.target.querySelector('.header_menu');
  if (editorOpen) {
    menuHeader.style.transition = 'none';
    const liList = menuHeader.querySelectorAll('.header_menu li');
    liList.forEach(li => (li.style.transition = 'none'));
  } else {
    const liList = menuHeader.querySelectorAll('.header_menu li');
    liList.forEach(li => (li.style.transition = 'opacity 0.25s 0.20s linear'));
  }
  editorOpen = true;
  const openHeaderMenuEvent = new Event('openHeaderMenu');
  document.body.dispatchEvent(openHeaderMenuEvent);
  const menuExpandedEvent = new Event('menuExpanded');
  document.body.dispatchEvent(menuExpandedEvent);
});

Shopify.addListener(document.body, 'shopify:section:deselect', e => {
  if (e.detail.sectionId !== 'header-menu') return;
  const menuHeader = e.target.querySelector('.header_menu');
  if (editorOpen) {
    menuHeader.style.transition = 'transform 0.25s ease-out';
    const liList = menuHeader.querySelectorAll('.header_menu li');
    liList.forEach(li => (li.style.transition = 'opacity 0.1s linear'));
  }
  editorOpen = false;
  const closeHeaderMenuEvent = new Event('closeHeaderMenu');
  document.body.dispatchEvent(closeHeaderMenuEvent);
  const menuUnexpandedEvent = new Event('menuUnexpanded');
  document.body.dispatchEvent(menuUnexpandedEvent);
});
