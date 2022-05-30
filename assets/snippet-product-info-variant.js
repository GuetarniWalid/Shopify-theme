class ProductInfoVariant extends HTMLElement {
  withVariants;
  variantsDiv;
  optionsDiv;
  optionsButtons;
  seeMoreButtons;
  arrow;
  variantsAvailable;
  variantsBeforePrice;
  variantsPrice;
  reducedPercent;
  variantsTitle;
  variantSaved;
  countryIso;
  hideBeforePrice;

  constructor() {
    super();
    this.variantsDiv = this.querySelector('.variants');
    this.optionsDiv = this.querySelectorAll('.option');
    this.optionsButtons = this.querySelectorAll('.option button');
    this.arrow = this.querySelector('.arrow').innerHTML;
    this.variantsAvailable = this.formatTo('boolean', this.dataset.variantsAvailable);
    this.variantsBeforePrice = this.formatTo('number', this.dataset.variantsBeforePrice);
    this.variantsPrice = this.formatTo('number', this.dataset.variantsPrice);
    this.reducedPercent = this.calculPromotions(this.variantsPrice, this.variantsBeforePrice);
    this.variantsTitle = this.formatTo('string', this.dataset.variantsTitle);
    this.variantSaved = this.variantsTitle[0];
    this.countryIso = this.dataset.countryIso;
  }

  connectedCallback() {
    //add "see more" if too many otions in a variant
    this.optionsDiv.forEach(optionDiv => {
      const tooManyOptions = this.isOverflown(optionDiv);
      if (tooManyOptions) {
        const lastVisibleOption = this.getLastVisibleOption(optionDiv);
        this.replaceBySeeMore(lastVisibleOption);
      }
    });

    //to handle selected option
    this.optionsButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.showOptionSelected(button);
        const optionPosition = this.getOptionPosition(button);
        this.replaceVariantTextWithOptionSelected(button, optionPosition);
        this.updatePrice(button, optionPosition);
      });
    });
  }

  isOverflown({ clientHeight, scrollHeight }) {
    return scrollHeight > clientHeight * 1.5;
  }

  getLastVisibleOption(optionDiv) {
    const options = Array.from(optionDiv.querySelectorAll('button'));
    const firstHiddenOptionIndex = options.findIndex(option => this.isHidden(options[0], option));
    return options[firstHiddenOptionIndex - 1];
  }

  isHidden({ offsetTop: firstOffsetTop }, { offsetTop }) {
    return offsetTop > firstOffsetTop;
  }

  replaceBySeeMore(button) {
    const parent = button.parentNode;
    const clone = button.cloneNode();
    clone.style.width = getComputedStyle(button).width;

    clone.innerHTML = this.arrow;
    clone.classList.add('seeMore');

    clone.addEventListener('click', () => {
      if (parent.classList.contains('unexpanded')) {
        clone.innerHTML = this.arrow;
        clone.replaceWith(button);
        parent.appendChild(clone);
      } else {
        clone.innerHTML = this.arrow;
        button.replaceWith(clone);
      }
      parent.classList.toggle('expanded');
      parent.classList.toggle('unexpanded');
    });
    button.replaceWith(clone);
  }

  showOptionSelected(button) {
    button.parentNode.querySelector('.selected').classList.remove('selected');
    button.classList.add('selected');
  }

  replaceVariantTextWithOptionSelected(button, optionPosition) {
    const newOption = button.dataset.value;
    const Spans = this.variantsDiv.children;
    const span = Spans[optionPosition];
    if (span.classList.contains('color')) {
      const isUncontrasted = button.classList.contains('uncontrasted');
      span.classList.toggle('uncontrasted', isUncontrasted);
      span.style.background = newOption;
    } else {
      span.innerText = newOption;
    }
  }

  formatTo(type, stringWithComma) {
    const arrayOfString = stringWithComma.split(',');
    //remove the excess value due to the trailing comma
    arrayOfString.pop();

    return arrayOfString.map(value => {
      switch (type) {
        case 'number':
          return Number(value);
        case 'boolean':
          return value === 'true';
        default:
          return value;
      }
    });
  }

  calculPromotions(partials, totals) {
    return partials.map((partial, index) => {
      return this.calculPercent(partial, totals[index]);
    });
  }

  calculPercent(partial, total) {
    if (!total) return 0;
    const percentOfTotal = partial / total;
    return Math.round((1 - percentOfTotal) * 100);
  }

  updatePrice(button, optionPosition) {
    this.updateVariantSaved(button, optionPosition);
    const variantIndex = this.variantsTitle.indexOf(this.variantSaved);
    this.showNewBeforePrice(variantIndex);
    this.showNewPrice(variantIndex);
    this.showNewPercent(variantIndex);
  }

  updateVariantSaved(button, optionPosition) {
    const newOption = button.dataset.value;
    const splitVariant = this.variantSaved.split(' / ');
    splitVariant[optionPosition] = newOption;
    this.variantSaved = splitVariant.join(' / ');
  }

  showNewBeforePrice(index) {
    const node = this.querySelector('.price .crossed .number');
    const newPrice = this.formatPrice(this.variantsBeforePrice[index]);
    this.hideBeforePrice = newPrice === '0';
    node.parentElement.classList.toggle('hidden', this.hideBeforePrice);
    if (!this.hideBeforePrice) {
      node.innerText = newPrice;
      this.restartAnimation(node.parentElement);
      this.restartAnimation(node.nextElementSibling);
    }
  }

  showNewPrice(index) {
    const newPrice = this.formatPrice(this.variantsPrice[index]);
    const node = this.querySelector('.price .current .number');
    node.innerText = newPrice;
    if (!this.hideBeforePrice) this.restartAnimation(node.parentElement);
  }

  showNewPercent(index) {
    const node = this.querySelector('.price .percent');
    const newPercent = this.reducedPercent[index];
    const toHide = Number(newPercent) < 1;
    node.classList.toggle('hidden', toHide);
    if (!toHide) {
      node.innerText = newPercent + '%';
      this.restartAnimation(node);
    }
  }

  getOptionPosition(button) {
    return Array.prototype.indexOf.call(this.optionsDiv, button.parentElement.parentElement);
  }

  formatPrice(price) {
    return (price / 100).toLocaleString(this.countryIso);
  }

  restartAnimation(node) {
    node.style.animation = 'none';
    node.offsetHeight; /* trigger reflow */
    node.style.animation = null;
  }
}

customElements.define('product-info-variant', ProductInfoVariant);
