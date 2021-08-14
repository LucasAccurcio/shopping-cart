const API_URL = 'https://api.mercadolibre.com/sites/MLB/search?q=computador';

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

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function arrayProducts(array) {
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

async function cartItemClickListener(event) {
  // coloque seu código aqui
  await fetch(event)
    .then((response) => response.json())
    .then((data) => {
      const array = data.results;
      arrayProducts(array);
    });
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function insertItemCart(array) {
  const objToAdd = {
    sku: array.id,
    name: array.title,
    salePrice: array.price,
  };
  const li = createCartItemElement(objToAdd);
  document.querySelector('.cart__items').appendChild(li);
}

async function addCartItemElement(id) {
  const itemUrl = `https://api.mercadolibre.com/items/${id}`;
  await fetch(itemUrl)
    .then((response) => response.json())
    .then((data) => insertItemCart(data))
    .catch(() => new Error('Indisponível'));
}

window.onload = async () => {
  await cartItemClickListener(API_URL);
  const btnAddItem = document.querySelectorAll('.item__add');
  const sku = document.querySelectorAll('.item__sku');
  for (let i = 0; i < btnAddItem.length; i += 1) {
    const id = sku[i].innerHTML;
    btnAddItem[i].addEventListener('click', (() => addCartItemElement(id)));
  }
};
