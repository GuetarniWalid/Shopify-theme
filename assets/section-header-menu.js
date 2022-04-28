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