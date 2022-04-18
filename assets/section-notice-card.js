function errorIcon(background, color) {
  return `
    <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-error" width="22" viewBox="0 0 13 13">
      <circle cx="6.5" cy="6.5" r="5.5" fill="${color}" stroke="${color}" stroke-width="0.7"/>
      <path d="M5.87413 3.17832H5.51535L5.52424 3.537L5.6245 7.58083L5.63296 7.92216H5.97439H7.02713H7.36856L7.37702 7.58083L7.47728 3.537L7.48617 3.17832H7.12739H5.87413ZM6.50076 10.0109C7.06121 10.0109 7.5317 9.57872 7.5317 9.00504C7.5317 8.43137 7.06121 7.99918 6.50076 7.99918C5.94031 7.99918 5.46982 8.43137 5.46982 9.00504C5.46982 9.57872 5.94031 10.0109 6.50076 10.0109Z" fill="${background}" stroke="${color}" stroke-width="0.7">
    </svg>`;
}

class NoticeCard extends HTMLElement {
  wrapperNoticeCards;
  dataElem;
  card;
  timer;

  constructor(status, title, text, side = 'right') {
    super();
    this.wrapperNoticeCards = document.body.querySelector('.wrapper-notice-cards');
    this.dataElem = this.wrapperNoticeCards.querySelector('data');
    const { animationIn, animationOut, inverseOfSide } = this.CSSBySide(side);
    const { borderRadius, shadow, background, color, barColor } = this.CSSByStatus(status);
    const iconFunc = this.iconFuncByStatus(status);
    this.innerHTML = `
    <style>
      .wrapper-notice-cards {
        ${side}: 0;
        ${inverseOfSide}: unset;
        padding-${side}: 0;
      }
      .notice-card.appear {
        animation: ${animationIn} 0.3s linear alternate forwards;
      }  
      .notice-card.hide {
          animation: ${animationOut} 0.3s linear alternate forwards !important;
      }
    </style>
    <div class="notice-card appear" style="background:${background};color:${color};box-shadow:${shadow};border-radius:${borderRadius}px;">
      <div class="notice-card-wrapper">
        <svg style="stroke:${color};" xmlns="http://www.w3.org/2000/svg" width="20" aria-hidden="true" focusable="false" role="presentation" class="icon icon-close" fill="none" viewBox="0 0 18 17">
          <path d="M.865 15.978a.5.5 0 00.707.707l7.433-7.431 7.579 7.282a.501.501 0 00.846-.37.5.5 0 00-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 10-.707-.708L8.991 7.853 1.413.573a.5.5 0 10-.693.72l7.563 7.268-7.418 7.417z" fill="currentColor">
        </svg>
        <h4 style="color:${color};">
          ${iconFunc(background, barColor)}
          ${title}
        </h4>
        <p>${text}</p>
      </div>
      <div class="notice-card-time-bar" style="background:${barColor}"></div>
    </div>
    `;
    this.wrapperNoticeCards.appendChild(this);
  }

  connectedCallback() {
    this.card = this.querySelector('.notice-card');

    //to close by hte cross
    Shopify.addListener(this.querySelector('svg'), 'click', this.removeCard.bind(this));

    //trigger timer
    Shopify.removeListener(this.querySelector('svg'), 'click', this.removeCard);
    this.timer = setTimeout(() => {
      this.removeCard();
    }, 5000);

    //to remove card from DOM
    Shopify.addListener(this.card, 'animationend', e => {
      if (e.animationName === 'debounceRight' || e.animationName === 'debounceLeft') this.animateCardRemove(e);
    });
    Shopify.addListener(this.card, 'transitionend', e => {
      this.remove();
    });
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
  }

  removeCard() {
    this.card.classList.add('hide');
    this.card.classList.remove('visible');
  }

  animateCardRemove(e) {
    const height = e.target.scrollHeight;
    requestAnimationFrame(() => {
      e.target.style.height = height + 'px';
      requestAnimationFrame(() => {
        e.target.style.margin = '0';
        e.target.style.padding = '0';
        e.target.style.height = '0';
        e.target.style.minHeight = '0';
      });
    });
  }

  CSSByStatus(status) {
    const borderRadius = this.dataElem.dataset.borderRadius;
    const shadow = this.dataElem.dataset.shadow;
    const background = this.dataElem.dataset[`${status}Background`];
    const color = this.dataElem.dataset[`${status}Color`];
    const barColor = this.dataElem.dataset[`${status}BarColor`];
    return {
      borderRadius,
      shadow,
      background,
      color,
      barColor
    };
  }

  CSSBySide(side) {
    let animationIn = side === 'right' ? 'bounceRight' : 'bounceLeft';
    let animationOut = side === 'right' ? 'debounceRight' : 'debounceLeft';
    let inverseOfSide = side === 'right' ? 'left' : 'right';

    return {
      animationIn,
      animationOut,
      inverseOfSide,
    };
  }

  iconFuncByStatus(status) {
    switch (status) {
      case 'error':
        return errorIcon
    }
  }
}

customElements.define('notice-card', NoticeCard);

//create a card when an error occur
Shopify.addListener(document.body, 'showNoticeCard', e => {
  const { status, title, text, side } = e.payload;
  new NoticeCard(status, title, text, side);
});

//Part specific to Shopify Editor
let isCardVisible = false;
let noticeCard;
Shopify.addListener(document, 'shopify:section:select', e => {
  if (e.detail.sectionId !== 'notice-card') return;

  //Display a notice card
  noticeCard = new NoticeCard('error', 'Insufficient quantity', 'The quantity of selected product exceeds the available stock');
  if (isCardVisible) noticeCard.querySelector('.appear').style.animation = 'none';

  //Disable counter
  if (isCardVisible) noticeCard.querySelector('.notice-card-time-bar').style.animation = 'none';
  clearTimeout(noticeCard.timer);

  isCardVisible = true;
});

Shopify.addListener(document, 'shopify:section:deselect', e => {
  if (e.detail.sectionId !== 'notice-card') return;

  //Remove the notice card
  noticeCard.removeCard();
  isCardVisible = false;
});
