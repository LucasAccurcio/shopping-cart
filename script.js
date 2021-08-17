const query = 'computador';
const API_URL = `https://api.mercadolibre.com/sites/MLB/search?q=${query}`;

/* function getLocalStorage() {

}

function setLocalStorage() {

} */

function totalPrice(param, valor) {
  const valorLocalStorage = localStorage.getItem('total');
  const spanPrice = document.querySelector('.total-price');
  let total = parseFloat(valorLocalStorage);
  if (valorLocalStorage === null) {
    localStorage.setItem('total', (valor.toFixed(2)));
    spanPrice.innerHTML = `${valor}`;
  } else if (param === '+') {
    total += valor;
    localStorage.setItem('total', ((total.toFixed(2))));
    spanPrice.innerHTML = `${total}`;
  } else {
    total -= valor;
    localStorage.setItem('total', (total.toFixed(2)));
    spanPrice.innerHTML = `${total}`;
  }
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

/* function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
} */

function showProducts(array) {
  const itemChild = document.querySelector('.items');
  const obj = array.map((curr) => ({ 
    sku: curr.id,
    name: curr.title,
    image: curr.thumbnail, 
  }));
  for (let i = 0; i < obj.length; i += 1) {
    itemChild.appendChild(createProductItemElement(obj[i]));
  } 
}

function displayLoading() {
  const container = document.querySelector('.container');
  const loader = document.createElement('span');
  loader.innerHTML = 'loading';
  loader.classList.add('loading');
  container.before(loader);
  setTimeout(() => {
    loader.remove();
  }, 5000);
}

function hideLoading() {
  const loader = document.querySelector('.loading');
  loader.remove();
}

async function searchProducts(event) {
  await fetch(event)
  .then((response) => {
    displayLoading();
    return response.json();
  })
  .then((data) => {
      hideLoading();
      const array = data.results;
      showProducts(array);
    });
}

async function cartItemClickListener(event) {
  // coloque seu código aqui
  const cartItemList = document.querySelector('.cart__items');
  if (event === 'clean') { // Apaga toda lista
    cartItemList.innerHTML = '';
  } else { // Apaga somente um evento da lista
    const itemDeleted = event.target.innerText;
    const valor = parseFloat(itemDeleted.slice(itemDeleted.indexOf('$') + 1));
    await totalPrice('-', valor);
    cartItemList.removeChild(event.target);
  }
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

async function insertItemCart(array) {
  const objToAdd = {
    sku: array.id,
    name: array.title,
    salePrice: array.price,
  };
  await totalPrice('+', array.price);
  const li = createCartItemElement(objToAdd);
  const listItems = document.querySelector('.cart__items');
  listItems.appendChild(li);
}

async function addCartItemElement(id) {
  const itemUrl = `https://api.mercadolibre.com/items/${id}`;
  await fetch(itemUrl)
    .then((response) => response.json())
    .then((data) => insertItemCart(data))
    .catch(() => new Error('Indisponível'));
}

function initialRenderization() {
/*   if (localStorage.getItem('cartItemList') === null) {
    localStorage.setItem('cartItemList', ([]));
  } else {
    getLocalStorage();
  } */
}

async function emptyCart() {
  const btnEmptyCart = document.querySelector('.empty-cart');
  btnEmptyCart.addEventListener('click', () => {
  localStorage.clear();
  const spanPrice = document.querySelector('.total-price');
  spanPrice.innerHTML = '';
  cartItemClickListener('clean'); // Limpar todos os campos da lista
    initialRenderization();
  });
}

window.onload = async () => {
  initialRenderization();
  emptyCart();
  await searchProducts(API_URL);
  const btnAddItem = document.querySelectorAll('.item__add');
  const sku = document.querySelectorAll('.item__sku');
  for (let i = 0; i < btnAddItem.length; i += 1) {
    const id = sku[i].innerHTML;
    btnAddItem[i].addEventListener('click', (() => addCartItemElement(id)));
  }
};
