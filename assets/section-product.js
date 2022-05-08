class ProductCarouselSection extends HTMLElement {
  thumbnailSplide;
  mainSplide;
  isThumbnail;

  constructor() {
    super();
    this.isThumbnail = this.querySelector('#thumbnail-carousel') ? true : false;
    //when shopify-editor is open
    this.startMediaIndex = Shopify?.section?.productCarousel?.selectedMediaIndex ?? 0

    const mainCarousel = this.querySelector('#main-carousel');
    this.mainSplide = new Splide(mainCarousel, {
      fixedWidth: '100%',
      fixedHeight: '100%',
      rewind: true,
      rewindByDrag: true,
      pagination: this.isThumbnail ? false : true,
      arrows: false,
      //when shopify-editor is open
      start: this.startMediaIndex
    });

    if (!this.isThumbnail) return;

    const thumbnailCarousel = this.querySelector('#thumbnail-carousel');
    this.thumbnailSplide = new Splide(thumbnailCarousel, {
      fixedWidth: '100%',
      fixedHeight: '100%',
      cover: true,
      gap: 10,
      rewind: true,
      rewindByDrag: true,
      pagination: false,
      focus: 'center',
      isNavigation: true,
      trimSpace: false,
      breakpoints: {
        800: {
          arrows: false,
        },
      },
    });
  }

  connectedCallback() {
    if (this.isThumbnail) {
      this.thumbnailSplide.mount();
      this.mainSplide.sync(this.thumbnailSplide);
    }
    this.mainSplide.mount();
  }

  disconnectedCallback() {
    this.mainSplide.destroy(true);
  }
}

customElements.define('product-carousel-section', ProductCarouselSection);
