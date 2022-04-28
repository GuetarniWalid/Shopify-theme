class CartSectionCollapse extends CartSection {
  closeButton;
  updateFromOutsideRef;

  constructor() {
    super();
    this.customElemName = 'cart-section-collapse';
    this.closeButton = this.querySelector('.cart-header button');
    this.updateFromOutsideRef = this.updateFromOutside.bind(this)
    this.openCartCollapseRef = this.openCartCollapse.bind(this)
    this.closeCartCollapseRef = this.closeCartCollapse.bind(this)
  }

  connectedCallback() {
    super.connectedCallback();
    //to avoid a transition at first display, transition is set here
    this.parentElement.style.transition = 'transform 0.3s ease-out';

    //To close cart-collapse
    Shopify.addListener(this.closeButton, 'click', this.triggerCloseEvent);
    Shopify.addListener(document.body, 'closeCartCollapse', this.closeCartCollapseRef);

    //To open cart-collapse
    Shopify.addListener(document.body, 'openCartCollapse', this.openCartCollapseRef);

    //To update when a product is added from elsewhere
    Shopify.addListener(document.body, 'fetchNewProductQty', this.updateFromOutsideRef);
  }

  disconnectedCallback() {
    Shopify.removeListener(document.body, 'fetchNewProductQty', this.updateFromOutsideRef)
    Shopify.removeListener(document.body, 'openCartCollapse', this.openCartCollapseRef)
    Shopify.removeListener(document.body, 'closeCartCollapse', this.closeCartCollapseRef)
  }

  triggerCloseEvent() {
    const closeCartCollapseEvent = new Event('closeCartCollapse');
    document.body.dispatchEvent(closeCartCollapseEvent);
  }

  closeCartCollapse() {
    this.parentElement.style.transform = 'translateX(100%)';
    const closeShadowBackgroundEvent = new Event('closeShadowBackground');
    document.body.dispatchEvent(closeShadowBackgroundEvent);
    document.body.style.overflow = 'auto';
  }

  openCartCollapse() {
    const openCShadowBackgroundEvent = new Event('openShadowBackground');
    document.body.dispatchEvent(openCShadowBackgroundEvent);
    document.body.style.overflow = 'hidden';
    this.parentElement.style.transform = 'translateX(0)';
  }

  updateFromOutside(e) {
    this.updateHTML(e.json.sections);
    const openCartCollapseEvent = new Event('openCartCollapse');
    document.body.dispatchEvent(openCartCollapseEvent);
  }
}

customElements.define('cart-section-collapse', CartSectionCollapse);