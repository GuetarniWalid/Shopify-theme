let cartSection;
let shadowBackground;
let closeButton;
let counters;
let prices;
let countersButtons = [];
let removeButtons;
let wrapperRows;

function assignVariable() {
  shadowBackground = document.getElementById('shadow-background');
  cartSection = document.querySelector('.cart-collapse-section');
  wrapperRows = cartSection.querySelectorAll('.cart-collapse-product-raw');
  closeButton = cartSection.querySelector('.cart-collapse-header button');
  counters = cartSection.querySelectorAll('.cart-collapse-product-raw-counter');
  counters.forEach(counter => {
    const buttons = counter.querySelectorAll('button');
    buttons.forEach(button => countersButtons.push(button));
  });
  prices = cartSection.querySelectorAll('.cart-collapse-product-raw-prices');
  removeButtons = cartSection.querySelectorAll('.cart-collapse-product-raw-title button');
}

function addAllEventListener() {
  //To close cart-collapse
  closeButton.addEventListener('click', event => {
    cartSection.classList.add('translate_right');
    shadowBackground.style.display = 'none';
  });

  //To open cart-collapse
  document.body.addEventListener('openCartCollapse', () => {
    document.body.style.overflow = 'hidden';
    cartSection.classList.remove('translate_right');
    shadowBackground.style.display = 'block';
  });

  //To increment or decrement number of products
  countersButtons.forEach(node => Shopify.addListener(node, 'click', updateCart));
  removeButtons.forEach(node => Shopify.addListener(node, 'click', updateCart));

  //To remove cards
  wrapperRows.forEach(wrapperRow => {
    wrapperRow.addEventListener('transitionend', animateCardRemove);
  });
}

async function updateCart() {
  try {
    const { wrapperRow, qtyBox, pricesNode, spinner } = selectNodes(this);
    const newQty = updateItemsQuantity(this, qtyBox);
    enableLoading(pricesNode, spinner);
    const json = await fetchData(wrapperRow.dataset.variantId, newQty);
    if (newQty === 0) removeCard(wrapperRow, json);
    else reboot(json);
  } catch (error) {
    location.reload();
  }
}

function selectNodes(buttonListenerNode) {
  const wrapperRow = buttonListenerNode.parentNode.parentNode;
  const qtyBox = wrapperRow.querySelector('.cart-collapse-product-raw-img-box span');
  const pricesNode = wrapperRow.querySelector('.cart-collapse-product-raw-prices p');
  const spinner = wrapperRow.querySelector('.cart-collapse-product-raw-prices>div');

  return {
    wrapperRow,
    qtyBox,
    pricesNode,
    spinner,
  };
}

function updateItemsQuantity(button, elem) {
  let newQty = button.dataset.quantity;
  elem.innerText = newQty;
  return Number(newQty);
}

function enableLoading(pricesNode, spinner) {
  countersButtons.forEach(button => (button.disabled = true));
  removeButtons.forEach(button => (button.disabled = true));
  pricesNode.classList.add('hidden');
  spinner.classList.remove('hidden');
  document.activeElement.blur();
  spinner.firstChild.nextSibling.setAttribute('aria-hidden', false);
}

async function fetchData(id, quantity) {
  const body = JSON.stringify({
    id,
    quantity,
    sections: cartSection.dataset.sectionId,
  });
  const response = await fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } });
  const json = await response.json();

  // this.updateLiveRegions(line, parsedState.item_count);
  // const lineItem =  document.getElementById(`CartItem-${line}`);
  // if (lineItem && lineItem.querySelector(`[name="${name}"]`)) lineItem.querySelector(`[name="${name}"]`).focus();
  // this.disableLoading();
  return json;
}

function updateHTML(sections, sectionName) {
  const elementToReplace = cartSection.querySelector('.cart-collapse-body');
  elementToReplace.innerHTML = getSectionInnerHTML(sections[sectionName], '.cart-collapse-body');
}

function getSectionInnerHTML(html, selector) {
  return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
}

function removeCard(node, json) {
  node.json = json;
  node.classList.add('remove');
}

function cleanUnusedEvent() {
  countersButtons.forEach(node => Shopify.removeListener(node, 'click', updateCart));
  removeButtons.forEach(node => Shopify.removeListener(node, 'click', updateCart));
  wrapperRows.forEach(wrapperRow => {
    Shopify.removeListener(wrapperRow, 'transitionend', animateCardRemove);
  });
}

function animateCardRemove(e) {
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
    reboot(e.target.json);
  }
}

function boot() {
  assignVariable();
  addAllEventListener();
}

function reboot(json) {
  try {
    updateHTML(json.sections, cartSection.dataset.sectionId);
    cleanUnusedEvent();
    boot();
  } catch (error) {
    location.reload();
  }
}

boot();
