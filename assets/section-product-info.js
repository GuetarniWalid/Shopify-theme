class ProductInfo extends HTMLElement {
  readMoreButton;
  readLessButton;
  descriptionWrapper;

  constructor() {
    super();
    this.readMoreButton = this.querySelector('.description .read.more');
    this.readLessButton = this.readMoreButton.nextElementSibling;
    this.descriptionWrapper = this.readMoreButton.previousElementSibling;
    console.log('🚀 ~ this.descriptionWrapper', this.descriptionWrapper)
  }

  connectedCallback() {
    [this.readMoreButton, this.readLessButton].forEach(button => {
      button.addEventListener('click', this.toggleDescriptionVisibility.bind(this));
    });
  }

  toggleDescriptionVisibility() {
    this.descriptionWrapper.classList.toggle('truncate');
    this.readMoreButton.classList.toggle('hidden');
    this.readLessButton.classList.toggle('hidden');
  }
}

customElements.define('product-info', ProductInfo);
