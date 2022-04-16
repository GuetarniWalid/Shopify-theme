class SectionMainProduct {
  productForm;
  variantId;
  quantityInput;
  sectionsToFetch = ['cart'];

  constructor() {
    this.productForm = document.getElementById('main-product-form');
    this.variantId = this.productForm.querySelector('[name=id]').value;
    this.quantityInput = this.productForm.querySelector('[name=quantity]');
    this.addAllListener();
  }

  addAllListener() {
    Shopify.addListener(this.productForm, 'submit', this.onSubmitHandler.bind(this));
  }

  async onSubmitHandler(evt) {
    evt.preventDefault();
    this.enableLoading(evt.submitter);

    try {
      const json = await this.fetchData();
      this.triggerEvent(json);
      this.resetCounter();
      this.disableLoading(evt.submitter);
    } catch (error) {
      location.reload();
    }
  }

  enableLoading(submitButton) {
    submitButton.classList.add('loading');
    submitButton.querySelector('.loading-overlay__spinner').classList.remove('hidden');
    submitButton.setAttribute('aria-disabled', true);
  }

  disableLoading(submitButton) {
    submitButton.classList.remove('loading');
    submitButton.querySelector('.loading-overlay__spinner').classList.add('hidden');
    submitButton.removeAttribute('aria-disabled');
  }

  async fetchData() {
    const body = JSON.stringify({
      id: this.variantId,
      quantity: this.quantityInput.value,
      sections: this.sectionsToFetch,
    });

    const response = await fetch(`${routes.cart_add_url}`, { ...fetchConfig(), ...{ body } });
    const json = await response.json();
    return json;
  }

  resetCounter() {
    this.quantityInput.value = '1';
  }

  triggerEvent(json) {
    const fetchNewProductQtyEvent = new Event('fetchNewProductQty');
    fetchNewProductQtyEvent.json = json;
    document.body.dispatchEvent(fetchNewProductQtyEvent);
  }
}

new SectionMainProduct();
