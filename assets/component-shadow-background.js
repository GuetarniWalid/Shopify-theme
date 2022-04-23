class ShadowBackground extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = '<div id="shadow-background"><br/></div>';
  }

  connectedCallback() {
    //create an event to close section/cart-collapse
    Shopify.addListener(this.firstChild, 'click', () => {
      const closeCartCollapseEvent = new Event('closeCartCollapse');
      document.body.dispatchEvent(closeCartCollapseEvent);
    });

    Shopify.addListener(document.body, 'closeShadowBackground', () => {
      this.firstChild.style.display = 'none';
    });

    Shopify.addListener(document.body, 'openShadowBackground', () => {
      this.firstChild.style.display = 'block';
    });
  }
}

customElements.define('shadow-background', ShadowBackground);
