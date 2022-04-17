class CartSection extends HTMLElement {
  customElemName = 'cart-section';
  sectionName;
  counters;
  countersButtons = [];
  removeButtons;
  wrapperRows;
  body;
  footer;
  cartButton;
  checkoutButton;

  constructor() {
    super();
    this.sectionName = this.querySelector('.cart-header').dataset.sectionId;
    this.wrapperRows = this.querySelectorAll('.cart-product-raw');
    this.counters = this.querySelectorAll('.cart-product-raw-counter');
    this.counters.forEach(counter => {
      const buttons = counter.querySelectorAll('button');
      buttons.forEach(button => this.countersButtons.push(button));
    });
    this.removeButtons = this.querySelectorAll('.cart-product-raw-title button');
    this.body = this.querySelector('.cart-body');
    this.footer = this.querySelector('.cart-footer');
    this.cartButton = this.footer.querySelector('.cart-footer-payment-cart')
    this.checkoutButton = this.footer.querySelector('.cart-footer-payment-checkout')
  }

  connectedCallback() {
    // Add all eventListener
    //To increment or decrement number of products
    this.countersButtons.forEach(countersButton => Shopify.addListener(countersButton, 'click', this.updateCart.bind(this, countersButton)));
    this.removeButtons.forEach(removeButton => Shopify.addListener(removeButton, 'click', this.updateCart.bind(this, removeButton)));

    //To remove cards
    this.wrapperRows.forEach(wrapperRow => {
      Shopify.addListener(wrapperRow, 'transitionend', this.animateCardRemove.bind(this));
    });

    //To check RGPD
    if(this.cartButton) {
      Shopify.addListener(this.cartButton, 'click', (e) => {
        e.preventDefault()      
        const input = this.footer.querySelector('[name=rgpd]')
        if(!input) location.assign('/cart')
        else if(input && input.checked) location.assign('/cart')
        else {
          const noticeCard = new Event('showNoticeCard')
          noticeCard.payload = {
            status: 'error',
            title: 'Test titre d\'erreur',
            text: 'Test de paragraphe d\'erreur',
            side: 'left'
          }
          document.body.dispatchEvent(noticeCard);
        }
      })
    }

    Shopify.addListener(document.body, 'fetchNewProductQty', e => {
      try {
        this.updateHTML(e.json);
      } catch (error) {
        location.reload();  
      }
    });
  }

  disconnectedCallback() {
    this.countersButtons.forEach(node => Shopify.removeListener(node, 'click', this.updateCart));
    this.removeButtons.forEach(node => Shopify.removeListener(node, 'click', this.updateCart));
    this.wrapperRows.forEach(wrapperRow => {
      Shopify.removeListener(wrapperRow, 'transitionend', this.animateCardRemove);
    });
  }

  async updateCart(buttonListener) {
    try {
      const { wrapperRow, qtyBox, rowPrice, spinners, footerPrices } = this.selectNodes(buttonListener);
      const newQty = this.updateItemsQuantity(buttonListener, qtyBox);
      this.enableLoading(rowPrice, spinners, footerPrices);
      const json = await this.fetchData(wrapperRow.dataset.variantId, newQty);
      if (newQty === 0) this.removeCard(wrapperRow, json);
      else this.updateHTML(json.sections);
    } catch (error) {
      location.reload();
    }
  }

  selectNodes(buttonListener) {
    const wrapperRow = buttonListener.parentNode.parentNode;
    const qtyBox = wrapperRow.querySelector('.cart-product-raw-img-box span');
    const rowPrice = wrapperRow.querySelector('.cart-product-raw-prices p');
    const rowSpinner = wrapperRow.querySelector('.cart-product-raw-prices>div');
    const footerSpinners = this.footer.querySelectorAll('.loading-overlay__spinner');
    const footerPrices = this.footer.querySelectorAll('.cart-footer-price');

    return {
      wrapperRow,
      qtyBox,
      rowPrice,
      spinners: [rowSpinner, ...footerSpinners],
      footerPrices,
    };
  }

  updateItemsQuantity(button, elem) {
    let newQty = button.dataset.quantity;
    elem.innerText = newQty;
    return Number(newQty);
  }

  enableLoading(rowPrice, spinners, footerPrices) {
    this.countersButtons.forEach(button => (button.disabled = true));
    this.removeButtons.forEach(button => (button.disabled = true));
    rowPrice.classList.add('hidden');
    footerPrices.forEach(footerPrice => footerPrice.classList.add('hidden'));
    spinners.forEach(spinner => {
      spinner.classList.remove('hidden');
      spinner.firstChild.nextSibling.setAttribute('aria-hidden', false);
    });
    document.activeElement.blur();
  }

  async fetchData(id, quantity) {
    const body = JSON.stringify({
      id,
      quantity,
      sections: this.sectionName,
    });
    const response = await fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } });
    const json = await response.json();
    return json;
  }

  updateHTML(sections) {
    const newHTML = this.getSectionHTML(sections[this.sectionName])
    if(!newHTML) throw new Error('no html to parse')
    this.replaceWith(this.getSectionHTML(sections[this.sectionName], this.customElemName));
  }

  getSectionHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  removeCard(node, json) {
    node.json = json;
    node.classList.add('remove');
  }

  animateCardRemove(e) {
    if (e.propertyName === 'opacity') {
      const height = e.target.scrollHeight;
      requestAnimationFrame(() => {
        e.target.style.height = height + 'px';
        requestAnimationFrame(() => {
          e.target.style.margin = '0';
          e.target.style.padding = '0';
          e.target.style.height = '0';
        });
      });
    }
    if (e.propertyName === 'height') {
      try {
        this.updateHTML(e.target.json.sections);
      } catch (error) {
        location.reload()
      }
    }
  }
}

customElements.define('cart-section', CartSection);
