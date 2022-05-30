class ProductMainCarousel extends HTMLElement {
  carousel;
  glider;
  isThumbnailExist;
  nbMedias;

  constructor() {
    super();
    this.carousel = this.querySelector('.product-carousel-main .glider');
    this.isThumbnailExist = this.parentElement.querySelector('product-thumbnail-carousel');
  }

  connectedCallback() {
    this.glider = new Glider(this.carousel, {
      arrows: {
        prev: '.glider-prev',
        next: '.glider-next',
      },
      dots: this.isThumbnailExist ? null : '.glider-dots',
      scrollLock: true,
      scrollLockDelay: 50,
      rewind: true,
      draggable: true,
    });

    this.addEventListener('glider-slide-visible', e => {
      this.triggerSelectedMediaEvent(e.detail.slide);
    });

    document.body.addEventListener('mainCarouselSelectMedia', e => {
      this.glider.scrollItem(e.slide);
    });
  }

  disconnectedCallback() {
    this.glider.destroy();
  }

  triggerSelectedMediaEvent(slide) {
    const selectedMediaEvent = new Event('thumbnailCarouselSelectMedia');
    selectedMediaEvent.slide = slide;
    document.body.dispatchEvent(selectedMediaEvent);
  }
}

customElements.define('product-main-carousel', ProductMainCarousel);
