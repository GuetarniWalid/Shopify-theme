let shadowBackground;

function assignVariable() {
  shadowBackground = document.getElementById('shadow-background');
}

assignVariable();

//create an event to close section/cart-collapse
Shopify.addListener(shadowBackground, 'click', () => {
  const closeCartCollapseEvent = new Event('closeCartCollapse');
  document.body.dispatchEvent(closeCartCollapseEvent);
});

Shopify.addListener(document.body, 'closeShadowBackground', () => {
    shadowBackground.style.display = 'none'
})

Shopify.addListener(document.body, 'openShadowBackground', () => {
    shadowBackground.style.display = 'block'
})