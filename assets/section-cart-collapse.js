class CartSectionCollapse extends CartSection {
  closeButton;

  constructor() {
    super();
    this.closeButton = this.querySelector('.cart-header button');
  }

  connectedCallback() {
    super.connectedCallback()
    //to avoid a transition at first display, transition is set here
    this.parentElement.style.transition = 'transform 0.3s ease-out';
    
    //To close cart-collapse
    Shopify.addListener(this.closeButton, 'click', this.triggerCloseEvent);
    Shopify.addListener(document.body, 'closeCartCollapse', this.closeCartCollapse.bind(this));
    
    //To open cart-collapse
    Shopify.addListener(document.body, 'openCartCollapse', this.openCartCollapse.bind(this));
  }
  
  disconnectedCallback() {
    super.disconnectedCallback()
    Shopify.removeListener(this.closeButton, 'click', this.updateCart);
    Shopify.removeListener(document.body, 'click', this.updateCart);
    Shopify.removeListener(document.body, 'click', this.updateCart);
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
    document.body.style.overflow = 'hidden';
    this.parentElement.style.transform = 'translateX(0)';
  }
}

customElements.define('cart-section-collapse', CartSectionCollapse);


//Part specific to Shopify Editor
let isCartCollapseOpen = false
Shopify.addListener(document, 'shopify:section:select', (e) => {
  if(e.detail.sectionId !== 'cart') return
  if(isCartCollapseOpen) e.target.style.transition = 'none'
  const openCartCollapseEvent = new Event('openCartCollapse');
  document.body.dispatchEvent(openCartCollapseEvent);
  const openCShadowBackgroundEvent = new Event('openShadowBackground');
  document.body.dispatchEvent(openCShadowBackgroundEvent);
  isCartCollapseOpen = true
})

Shopify.addListener(document, 'shopify:section:deselect', (e) => {
  if(e.detail.sectionId !== 'cart') return
  e.target.style.transition = 'transform 0.3s ease-out'
  const closeCartCollapseEvent = new Event('closeCartCollapse');
  document.body.dispatchEvent(closeCartCollapseEvent);
  const closeCShadowBackgroundEvent = new Event('closeShadowBackground');
  document.body.dispatchEvent(closeCShadowBackgroundEvent);
  isCartCollapseOpen = false
})