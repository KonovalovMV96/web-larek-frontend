import { Basket, Catalog, Order } from './components/AppData';
import { BasketView } from './components/Basket';
import { CardPreview, CardView } from './components/Card';
import { OrderContactFormView, OrderDeliveryFormView } from './components/Order';
import { PageView } from './components/Page';
import { ShopAPI } from './components/ShopApi';
import { SuccessView } from './components/Success';
import { EventEmitter } from './components/base/Events';
import { Modal } from './components/common/Modal';
import './scss/styles.scss';
import { ICatalogData, IOrderForm, IProduct, ProductBasket } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

const events = new EventEmitter();
const api = new ShopAPI(CDN_URL, API_URL);

//Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderDeliveryTemplate = ensureElement<HTMLTemplateElement>('#order');
const orderContactTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Глобальные контейнеры
const page = new PageView(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Модели данных приложения
const catalog = new Catalog({}, events);
const basket = new Basket({}, events);
const order = new Order({}, events);

// Переиспользуемые части интерфейса
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderDeliveryFormView = new OrderDeliveryFormView(cloneTemplate(orderDeliveryTemplate), events);
const orderContactFormView = new OrderContactFormView(cloneTemplate(orderContactTemplate), events);
const successView = new SuccessView (cloneTemplate(successTemplate), {onClick:() => modal.close()})

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

//Каталог обновлен
events.on('catalog:updated', (data: ICatalogData) => {
	const catalog = data.catalog.map((product) => {
		const catalogCard = new CardView(
			'card',
			cloneTemplate(cardCatalogTemplate),
			{
				onClick: () => events.emit('product:select', product),
			}
		);
		return catalogCard.render({
			id: product.id,
			title: product.title,
			price: product.price,
			image: product.image,
			category: product.category,
		});
	});
	page.catalog = catalog;
});

//Продукт выбран (превью)
events.on('product:select', (product: IProduct) => {
	const cardPreview = new CardPreview(
		'card',
		cloneTemplate(cardPreviewTemplate),
		{
			onClick: () => {
				product.isAddedToBasket = !product.isAddedToBasket;
				if (product.isAddedToBasket) {
					events.emit('product:add', product);
				} else {
					events.emit('product:remove', product);
				}
			},
		}
	);
  const cardPreviewRender = {content: cardPreview.render({
    id:product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description,
    isAddedToBasket: product.isAddedToBasket,
  })}
  modal.render(cardPreviewRender)
});

//Товар добавлен в корзину
events.on('product:add',(product: IProduct)=> {
  basket.addProduct(product);
  modal.close();
})

//Товар удален из корзины
events.on('product:remove',(product: IProduct)=> {
  basket.removeProduct(product);
})

//Корзина обновлена
events.on('basket:update', (basket:ProductBasket[]) => {
  page.counter = basket.length;
})

// Корзина открыта
events.on('basket:open', () => {
	const basketData = basket.getproductList().basket;
	const cardBasketTemplates = basketData.map((product) => {
		const cardBasket = new CardView('card', cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				product.isAddedToBasket = !product.isAddedToBasket;
				events.emit('product:remove', product);
				events.emit('basket:open');
			},
		});
		return cardBasket.render({
			id: product.id,
			title: product.title,
			price: product.price,
		});
	});
	const basketRender = {
		content: basketView.render({
			items: cardBasketTemplates,
			total: basket.getTotal(),
		}),
	};
	modal.render(basketRender);
});

//Открыта модалка для ввода Delivery для заказа
events.on('order:open', ()=> {
  order.total = basket.getTotal();
  order.items = basket.getProductId();
  const orderDeliveryFormRender = {
    content: orderDeliveryFormView.render({
      address: '',
      payment: '',
      valid: false,
      errors: [],
    })
  }
	orderDeliveryFormView.resetButtonStatus();
  modal.render(orderDeliveryFormRender)
})

//Открыта модалка для ввода Contact для заказа
events.on('order.delivery:next', () => {
  const orderContactFormRender = {
    content: orderContactFormView.render({
      phone: '',
      email: '',
      valid: false,
      errors: [],
    })
  }
  modal.render(orderContactFormRender);
})

// Изменилось состояние валидации формы Delivery (ошибки в форме)
events.on('formErrors:change:Delivery', (errors: Partial<IOrderForm>) => {
	const { address, payment } = errors;
  orderDeliveryFormView.valid = !address && !payment;
  orderDeliveryFormView.errors = Object.values({address, payment}).filter(i => !!i).join('; ');
});

events.on(
	'order.delivery:change',
	(data: { field: keyof IOrderForm; value: IOrderForm[keyof IOrderForm] }) => {
		order.setDeliveryField(data.field, data.value);
	}
);

// Изменилось состояние валидации формы Contact (ошибки в форме)
events.on('formErrors:change:Contact', (errors: Partial<IOrderForm>) => {
  const { email, phone } = errors;
  orderContactFormView.valid = !email && !phone;
  orderContactFormView.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

events.on(
	'order.contact:change',
	(data: { field: keyof IOrderForm; value: IOrderForm[keyof IOrderForm] }) => {
		order.setContactField(data.field, data.value);
	}
);

// Заказ оформлен
events.on('order.contacts:next', () => {
	const { payment, email, phone, address } = order.order;
	api
		.orderProduct({
			payment,
			email,
			phone,
			address,
			total: order.total,
			items: order.items,
		})
		.then((data) => {
			basket.clearBasket();
			const successRender = {
				content: successView.render({					
					total: data.total,
				}),
			};
			modal.render(successRender);
			page.counter = 0;	
			order.clearOrder();
			getProductListApi();		
		})
		.catch((error) => {
			console.log(error);
		});
});


// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
  page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
  page.locked = false;
});

// Получаем данные с сервера
const getProductListApi = () => api
	.getProductList()
	.then((data) => catalog.setCatalog(data))
	.catch((error) => {
		console.log(error);
	});

	getProductListApi();