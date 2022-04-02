let html;
let header;
let infoELement;
let menuIcon;
let menuHeader;
let isBackgroundTransparent;
let backgroundColor;
let oldScrollBarToTop;
let newScrollBarToTop;
const transparentColor = 'transparent';
let distanceToTopBackgroundChange = 100;
let distanceToTopHeaderPosition = 20;
let isTransparencyActive;
let headerPosition = 'down';

function assignVariables() {
  html = document.querySelector('html');
  header = document.getElementById('shopify-section-header');
  infoELement = document.getElementById('header-info-element');
  menuIcon = document.querySelector('header svg:first-child');
  menuHeader = document.querySelector('.header_menu');
  backgroundColor = infoELement.dataset.backgroundColor;
  oldScrollBarToTop = html.scrollTop;
  isBackgroundTransparent = html.scrollTop === 0 ? true : false;
  isTransparencyActive = infoELement.dataset.headerTransparencyActive === 'true' ? true : false
}

function switchHeaderBackground(mode) {
  if (mode === 'firstDisplay') {
    setHeaderBackgroundAtFirstDisplay()
  } 
  else if(mode === 'normal') {
    setHeaderBackgroundWhenNormal()
  }
  else if(mode === 'menu-expanded') {
    modeColor();
  }
}

function setHeaderBackgroundAtFirstDisplay() {
  if (html.scrollTop < distanceToTopBackgroundChange) {
    modeTransparent();
  } else {
    modeColor();
  }
}

function setHeaderBackgroundWhenNormal() {
  //already displayed
  if (html.scrollTop <= distanceToTopBackgroundChange && !isBackgroundTransparent) {
    modeTransparent();
  } else if (html.scrollTop > distanceToTopBackgroundChange && isBackgroundTransparent) {
    modeColor();
  }
}

function modeTransparent() {
  changeHeaderBackgroundTo(transparentColor);
  changeHeaderIconsColor('transparent');
}

function modeColor() {
  changeHeaderBackgroundTo(backgroundColor);
  changeHeaderIconsColor('color');
}

function changeHeaderBackgroundTo(color) {
  header.style.background = color;
  isBackgroundTransparent = color === transparentColor ? true : false;
}

function changeHeaderIconsColor(mode) {
  if (mode === 'color') {
    infoELement.classList.replace('header_svg_fill_colorWhenTransparent', 'header_svg_fill_color');
  } else {
    infoELement.classList.replace('header_svg_fill_color', 'header_svg_fill_colorWhenTransparent');
  }
}

function switchHeaderPosition() {
  newScrollBarToTop = html.scrollTop;

  if(newScrollBarToTop < distanceToTopHeaderPosition && headerPosition === 'up') lowersHeader()
  else if (newScrollBarToTop > distanceToTopHeaderPosition && scrollDirection() === 'down' && headerPosition === 'down') raisesHeader();
  else if (newScrollBarToTop > distanceToTopHeaderPosition && scrollDirection() === 'up' && headerPosition === 'up') lowersHeader();

  oldScrollBarToTop = newScrollBarToTop;
}

function scrollDirection() {
  return newScrollBarToTop > oldScrollBarToTop ? 'down' : 'up'
}

function raisesHeader() {
  header.classList.add('header_translate_up');
  headerPosition = 'up'
}

function lowersHeader() {
  header.classList.remove('header_translate_up');
  headerPosition = 'down'
}

function scrollActions() {
  if (isTransparencyActive) switchHeaderBackground('normal');
  switchHeaderPosition();
}

assignVariables();

//at first display
if (isTransparencyActive) {
  switchHeaderBackground('firstDisplay');
}

document.addEventListener('scroll', scrollActions);

//already displayed and after changes in shopify editor
document.addEventListener('shopify:section:load', e => {
  assignVariables();

  if (isTransparencyActive) {
    switchHeaderBackground('firstDisplay');
  }
});


/**
 * drop-down menu part
 */
function expandMenu() {
  document.removeEventListener('scroll', scrollActions)
  menuIcon.removeEventListener('click', expandMenu)
  menuIcon.addEventListener('click', closeMenu)
  document.body.style.overflow = 'hidden';
  switchHeaderBackground('menu-expanded')
  menuHeader.classList.replace('header_menu_hidden', 'header_menu_visible')
}

function closeMenu() {
  document.addEventListener('scroll', scrollActions)
  menuIcon.removeEventListener('click', closeMenu)
  menuIcon.addEventListener('click', expandMenu)
  document.body.style.overflow = 'auto';
  switchHeaderBackground('firstDisplay')
  menuHeader.classList.replace('header_menu_visible', 'header_menu_hidden')
}


//if the menu is expanded
menuIcon.addEventListener('click', expandMenu)
