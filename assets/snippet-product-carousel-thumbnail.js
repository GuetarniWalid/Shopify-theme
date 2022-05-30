class ProductThumbnailCarousel extends HTMLElement {
  container;
  imageWrappers;
  imageWrapperSize;
  gapBetweenImage;
  oldMediaSelectedIndex;

  constructor() {
    super();
    this.container = this.querySelector('.product-carousel-thumbnail .product-thumbnail-container');
    this.imageWrappers = this.querySelectorAll('.product-carousel-thumbnail .product-thumbnail-image-wrapper');
    const imageWrapperSizeInRem = Number(this.imageWrappers[0].dataset.size);
    this.imageWrapperSize = this.convertRemToPixels(imageWrapperSizeInRem)
    const gapBetweenImageInRem = Number(this.container.dataset.gap)
    this.gapBetweenImage = this.convertRemToPixels(gapBetweenImageInRem)
  }

  connectedCallback() {
    //init
    this.highlightMediaSelected(0);

    document.body.addEventListener('thumbnailCarouselSelectMedia', e => {
      this.highlightMediaSelected(e.slide);
      this.showMediaSelected(e.slide);
    });

    this.imageWrappers.forEach((imageWrapper, index) => {
      imageWrapper.addEventListener('click', () => {
        const mainCarouselSelectMediaEvent = new Event('mainCarouselSelectMedia')
        mainCarouselSelectMediaEvent.slide = index
        document.body.dispatchEvent(mainCarouselSelectMediaEvent)
    })
      
    });
  }

  disconnectedCallback() {}

  convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  highlightMediaSelected(index) {
    this.imageWrappers[this.oldMediaSelectedIndex]?.classList.remove('active');
    this.imageWrappers[index].classList.add('active');
    this.oldMediaSelectedIndex = index;
  }

  showMediaSelected(index) {
    const positionToLeft = (this.imageWrapperSize + this.gapBetweenImage) * index
    this.container.scrollTo({
      top: 0,
      left: positionToLeft,
      behavior: 'smooth',
    });
  }
}

customElements.define('product-thumbnail-carousel', ProductThumbnailCarousel);
