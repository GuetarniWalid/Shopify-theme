class HeaderSection extends HTMLElement {
  html;
  header;
  infoELement;
  menuButton;
  isBackgroundTransparent;
  backgroundColor;
  oldScrollBarToTop;
  newScrollBarToTop;
  transparentColor = 'transparent';
  distanceToTopBackgroundChange = 100;
  distanceToTopHeaderPosition = 20;
  isTransparencyActive;
  headerPosition = 'down';
  headerCartButton;

  constructor() {
    super();
    this.html = document.querySelector('html');
    this.header = this.closest('#shopify-section-header');
    this.infoELement = this.querySelector('#header-info-element');
    this.menuButton = this.querySelector('#header-menu');
    this.backgroundColor = this.infoELement.dataset.backgroundColor;
    this.oldScrollBarToTop = this.html.scrollTop;
    this.isBackgroundTransparent = this.html.scrollTop === 0 ? true : false;
    this.isTransparencyActive = this.infoELement.dataset.headerTransparencyActive === 'true' ? true : false;
    this.headerCartButton = this.querySelector('#header-cart');
    this.scrollActionsRef = this.scrollActions.bind(this);
    this.handleHeaderMenuOpeningRef = this.handleHeaderMenuOpening.bind(this);
    this.handleHeaderMenuClosingRef = this.handleHeaderMenuClosing.bind(this);
  }

  connectedCallback() {
    //at first display
    this.switchHeaderBackground('firstDisplay');

    Shopify.addListener(document, 'scroll', this.scrollActionsRef);

    //part about the header-menu
    Shopify.addListener(this.menuButton, 'click', this.handleHeaderMenuOpeningRef);

    //create an event to open section/cart-collapse
    Shopify.addListener(this.headerCartButton, 'click', () => {
      const openCartCollapseEvent = new Event('openCartCollapse');
      document.body.dispatchEvent(openCartCollapseEvent);
    });

    //create events to integrate with shopify editor
    Shopify.addListener(document.body, 'menuExpanded', () => {
      this.switchHeaderBackground('menu-expanded');
    });

    Shopify.addListener(document.body, 'menuUnexpanded', () => {
      this.switchHeaderBackground('firstDisplay');
    });
  }

  switchHeaderBackground(mode) {
    switch (mode) {
      case 'firstDisplay':
        if (this.isTransparencyActive) this.setHeaderBackgroundAtFirstDisplay();
        break;
      case 'normal':
        this.setHeaderBackgroundWhenNormal();
        break;
      case 'menu-expanded':
        this.modeColor();
        break;
    }
  }

  setHeaderBackgroundAtFirstDisplay() {
    if (this.html.scrollTop < this.distanceToTopBackgroundChange) {
      this.modeTransparent();
    } else {
      this.modeColor();
    }
  }

  setHeaderBackgroundWhenNormal() {
    //already displayed
    if (this.html.scrollTop <= this.distanceToTopBackgroundChange && !this.isBackgroundTransparent) {
      this.modeTransparent();
    } else if (this.html.scrollTop > this.distanceToTopBackgroundChange && this.isBackgroundTransparent) {
      this.modeColor();
    }
  }

  modeTransparent() {
    this.changeHeaderBackgroundTo(this.transparentColor);
    this.changeHeaderIconsColor('transparent');
  }

  modeColor() {
    this.changeHeaderBackgroundTo(this.backgroundColor);
    this.changeHeaderIconsColor('color');
  }

  changeHeaderBackgroundTo(color) {
    this.header.style.background = color;
    this.isBackgroundTransparent = color === this.transparentColor ? true : false;
  }

  changeHeaderIconsColor(mode) {
    if (mode === 'color') {
      this.infoELement.classList.replace('header_svg_fill_colorWhenTransparent', 'header_svg_fill_color');
    } else {
      this.infoELement.classList.replace('header_svg_fill_color', 'header_svg_fill_colorWhenTransparent');
    }
  }

  switchHeaderPosition() {
    this.newScrollBarToTop = this.html.scrollTop;

    if (this.newScrollBarToTop < this.distanceToTopHeaderPosition && this.headerPosition === 'up') this.lowersHeader();
    else if (this.newScrollBarToTop > this.distanceToTopHeaderPosition && this.scrollDirection() === 'down' && this.headerPosition === 'down') this.raisesHeader();
    else if (this.newScrollBarToTop > this.distanceToTopHeaderPosition && this.scrollDirection() === 'up' && this.headerPosition === 'up') this.lowersHeader();

    this.oldScrollBarToTop = this.newScrollBarToTop;
  }

  scrollDirection() {
    return this.newScrollBarToTop > this.oldScrollBarToTop ? 'down' : 'up';
  }

  raisesHeader() {
    this.header.classList.add('translate_up');
    this.headerPosition = 'up';
  }

  lowersHeader() {
    this.header.classList.remove('translate_up');
    this.headerPosition = 'down';
  }

  scrollActions() {
    if (this.isTransparencyActive) this.switchHeaderBackground('normal');
    this.switchHeaderPosition();
  }

  //Header-menu part
  handleHeaderMenuOpening() {
    const openHeaderMenuEvent = new Event('openHeaderMenu');
    document.body.dispatchEvent(openHeaderMenuEvent);
    this.handleHeaderListener('open');
    this.switchHeaderBackground('menu-expanded');
    this.handleCartDisplay('hide');
  }

  handleHeaderMenuClosing() {
    const closeHeaderMenuEvent = new Event('closeHeaderMenu');
    document.body.dispatchEvent(closeHeaderMenuEvent);
    this.handleHeaderListener('close');
    this.switchHeaderBackground('firstDisplay');
    this.handleCartDisplay('show');
  }

  handleHeaderListener(action) {
    switch (action) {
      case 'open':
        Shopify.removeListener(document, 'scroll', this.scrollActionsRef);
        Shopify.removeListener(this.menuButton, 'click', this.handleHeaderMenuOpeningRef);
        Shopify.addListener(this.menuButton, 'click', this.handleHeaderMenuClosingRef);
        break;
      case 'close':
        Shopify.removeListener(this.menuButton, 'click', this.handleHeaderMenuClosingRef);
        Shopify.addListener(this.menuButton, 'click', this.handleHeaderMenuOpeningRef);
        Shopify.addListener(document, 'scroll', this.scrollActionsRef);
    }
  }

  handleCartDisplay(action) {
    switch (action) {
      case 'hide':
        this.headerCartButton.style.pointerEvents = 'none';
        this.headerCartButton.style.visibility = 'hidden';
        break;
      case 'show':
        this.headerCartButton.style.pointerEvents = 'auto';
        this.headerCartButton.style.visibility = 'visible';
    }
  }
}

customElements.define('header-section', HeaderSection);
