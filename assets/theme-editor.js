document.addEventListener('shopify:block:select', function (event) {
  const blockSelectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockSelectedIsSlide) return;

  const parentSlideshowComponent = event.target.closest('slideshow-component');
  parentSlideshowComponent.pause();

  setTimeout(function () {
    parentSlideshowComponent.slider.scrollTo({
      left: event.target.offsetLeft,
    });
  }, 200);
});

document.addEventListener('shopify:block:deselect', function (event) {
  const blockDeselectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockDeselectedIsSlide) return;
  const parentSlideshowComponent = event.target.closest('slideshow-component');
  if (parentSlideshowComponent.autoplayButtonIsSetToPlay) parentSlideshowComponent.play();
});

//Part for sections
let sectionOpen = false;

Shopify.addListener(document.body, 'shopify:section:select', e => {
  switch (e.detail.sectionId) {
    case 'header-menu':
      headerMenuOpen(e);
      break;
    case 'notice-card':
      noticeCardOpen(e);
      break;
    case 'cart':
      cartCollapseOpen(e);
      break;
    default:
      if (e.detail.sectionId.includes('product-carousel')) productCarouselOpen(e)
  }
});

Shopify.addListener(document.body, 'shopify:section:deselect', e => {
  switch (e.detail.sectionId) {
    case 'header-menu':
      headerMenuClose(e);
      break;
    case 'notice-card':
      noticeCardClose(e);
      break;
    case 'cart':
      cartCollapseClose(e);
      break;
  }
});

//section-header-menu
function headerMenuOpen(e) {
  const menuHeader = e.target.querySelector('.header_menu');
  if (sectionOpen) {
    menuHeader.style.transition = 'none';
    const liList = menuHeader.querySelectorAll('.header_menu li');
    liList.forEach(li => (li.style.transition = 'none'));
  } else {
    const liList = menuHeader.querySelectorAll('.header_menu li');
    liList.forEach(li => (li.style.transition = 'opacity 0.25s 0.20s linear'));
  }
  sectionOpen = true;
  const openHeaderMenuEvent = new Event('openHeaderMenu');
  document.body.dispatchEvent(openHeaderMenuEvent);
  const menuExpandedEvent = new Event('menuExpanded');
  document.body.dispatchEvent(menuExpandedEvent);
}

function headerMenuClose(e) {
  const menuHeader = e.target.querySelector('.header_menu');
  if (sectionOpen) {
    menuHeader.style.transition = 'transform 0.25s ease-out';
    const liList = menuHeader.querySelectorAll('.header_menu li');
    liList.forEach(li => (li.style.transition = 'opacity 0.1s linear'));
  }
  sectionOpen = false;
  const closeHeaderMenuEvent = new Event('closeHeaderMenu');
  document.body.dispatchEvent(closeHeaderMenuEvent);
  const menuUnexpandedEvent = new Event('menuUnexpanded');
  document.body.dispatchEvent(menuUnexpandedEvent);
}

//section-notice-card
let noticeCard;
function noticeCardOpen() {
  //Display a notice card
  noticeCard = new NoticeCard('error', 'Insufficient quantity', 'The quantity of selected product exceeds the available stock');
  if (sectionOpen) noticeCard.querySelector('.appear').style.animation = 'none';

  //Disable counter
  if (sectionOpen) noticeCard.querySelector('.notice-card-time-bar').style.animation = 'none';
  clearTimeout(noticeCard.timer);

  sectionOpen = true;
}

function noticeCardClose() {
  //Remove the notice card
  noticeCard.removeCard();
  sectionOpen = false;
}

//section-cart-collapse
function cartCollapseOpen(e) {
  if (sectionOpen) {
    e.target.style.transition = 'none';
    e.target.querySelectorAll('.cart-product-raw').forEach(raw => {
      raw.style.transition = 'none';
    });
    e.target.querySelector('.cart-footer').style.transition = 'none';
  }
  const openCartCollapseEvent = new Event('openCartCollapse');
  document.body.dispatchEvent(openCartCollapseEvent);
  const openCShadowBackgroundEvent = new Event('openShadowBackground');
  document.body.dispatchEvent(openCShadowBackgroundEvent);
  sectionOpen = true;
}

function cartCollapseClose(e) {
  e.target.style.transition = 'transform 0.3s ease-out';
  e.target.querySelectorAll('.cart-product-raw').forEach(raw => {
    raw.style.transition = 'all 0.3s ease-out';
  });
  e.target.querySelector('.cart-footer').style.transition = 'transform 0.3s ease-in-out';
  const closeCartCollapseEvent = new Event('closeCartCollapse');
  document.body.dispatchEvent(closeCartCollapseEvent);
  const closeCShadowBackgroundEvent = new Event('closeShadowBackground');
  document.body.dispatchEvent(closeCShadowBackgroundEvent);
  sectionOpen = false;
}

//section-product-carousel
function productCarouselOpen(e) {
  console.log('reaffiche');
  const productCarousel = e.target.querySelector('product-carousel-section');
  const mainSplide = productCarousel.mainSplide

  mainSplide.on('active', (target) => {
    Shopify.section = Shopify.section ?? {}
    Shopify.section.productCarousel = Shopify.section.productCarousel ?? {}
    Shopify.section.productCarousel.selectedMediaIndex = target.index
  })  
}
