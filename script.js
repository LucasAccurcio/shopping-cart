const query = 'computador';
const API_URL = `https://api.mercadolibre.com/sites/MLB/search?q=${query}`;

/* function setLocalStorage(obj, param) {
  const cart = JSON.parse(localStorage.getItem('cartItemList'));
  if (param === '+') {
    cart.push(obj);
    localStorage.setItem('cartItemList', JSON.stringify(cart));
  } else {
    const deletedCartItem = cart.filter((element) => element.sku !== obj);
    localStorage.setItem('cartItemList', JSON.stringify(deletedCartItem));   
  }
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
  } else if (param === 'recover') {
    spanPrice.innerHTML = `${valor}`;
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
  loader.innerHTML = 'loading...';
  loader.classList.add('loading');
  container.before(loader);
}

function hideLoading() {
  const loader = document.querySelector('.loading');
    loader.remove();
}

async function searchProducts(event) {
  displayLoading();
  await fetch(event)
  .then((response) => response.json())
  .then((data) => {
    hideLoading();
    const array = data.results;
    showProducts(array);
  });
}

function setLocalStorage(list) {
  localStorage.setItem('cartItemList', list.innerHTML);
}

function cartItemClickListener(event) {
  // coloque seu código aqui
  const cartItemList = document.querySelector('.cart__items');
  if (event === 'clean') { // Apaga toda lista
    cartItemList.innerHTML = '';
  } else { // Apaga somente um evento da lista
    const itemDeleted = event.target.innerText;
    const valor = parseFloat(itemDeleted.slice(itemDeleted.indexOf('$') + 1));
    // No item clicado, eu extraio o valor para remover do Valor Total
    totalPrice('-', valor);
    // const id = itemDeleted.slice(5, 18);
    cartItemList.removeChild(event.target);
    setLocalStorage(cartItemList);
    // será que consigo fazer um loop e encontrar em qual posição da lista foi clicado???
  }
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function apendItemToCart(obj) {
  const textTotalPrice = document.querySelector('.total-price-text');
  textTotalPrice.classList.add('display');
  const li = createCartItemElement(obj);
  const listItems = document.querySelector('.cart__items');
  listItems.appendChild(li);
  setLocalStorage(listItems);
}

function insertItemCart(array) {
  const objToAdd = {
    sku: array.id,
    name: array.title,
    salePrice: array.price,
  };
  totalPrice('+', array.price);
  apendItemToCart(objToAdd);
  // setLocalStorage(objToAdd, '+');
}

/* function getLocalStorage() {
  const loadCart = JSON.parse(localStorage.getItem('cartItemList'));
  const recoverTotal = loadCart.reduce((acc, value) => acc + value.salePrice, 0);
  const spanPrice = document.querySelector('.total-price');
  spanPrice.innerHTML = recoverTotal;
  if (loadCart.length > 0) {
    for (let i = 0; i < loadCart.length; i += 1) {
      apendItemToCart(loadCart[i]);
    }
  }
} */

function getLocalStorage() {
  const localStorageData = localStorage.getItem('cartItemList'); // recupera lista do LocalStorage e armazena na variável localStorageDate
  const arrayList = localStorageData.split('</li>'); // com a string gerada, cria um array de cada <li>
  arrayList.pop(); // Remove último item do array que será sempre vazio
  arrayList.forEach((item, index) => {
    arrayList[index] = item.replace('<li class="cart__item">', ''); // remove a tag <li class="cart__item"> do inicio de cada item do array
    const alias = arrayList[index]; // criei um apelido para encurtar o caminho
    const obj = { // Crio um objeto de acordo com o que é recebido pela função 'apendItemToCart'
      sku: alias.slice(5, alias.indexOf(' |')),
      name: alias.slice(alias.indexOf('NAME: ') + 6, alias.indexOf(' | P')),
      salePrice: alias.slice(alias.indexOf('$') + 1),
    };
    apendItemToCart(obj);
  });
  const localStorageTotalPrice = localStorage.getItem('total'); // Recupero o valor para mostrar no carrinho
  if (localStorageTotalPrice !== null) { 
    totalPrice('recover', localStorageTotalPrice); 
  }
}

async function addCartItemElement(id) {
  const itemUrl = `https://api.mercadolibre.com/items/${id}`;
  await fetch(itemUrl)
    .then((response) => response.json())
    .then((data) => insertItemCart(data))
    .catch(() => new Error('Indisponível'));
}

function initialRenderization() {
  if (localStorage.getItem('cartItemList') === null) {
    localStorage.setItem('cartItemList', JSON.stringify([]));
  } else {
    getLocalStorage();
  }
}

function emptyCart() {
  const btnEmptyCart = document.querySelector('.empty-cart');
  btnEmptyCart.addEventListener('click', () => {
    localStorage.clear();
    const spanPrice = document.querySelector('.total-price');
    spanPrice.innerHTML = '';
    cartItemClickListener('clean'); // Limpar todos os campos da lista
    const textTotalPrice = document.querySelector('.total-price-text');
    textTotalPrice.classList.remove('display');
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
