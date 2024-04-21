# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Об архитектуре 

Взаимодействия внутри приложения происходят через события. Модели инициализируют события, слушатели событий в основном коде выполняют передачу данных компонентам отображения, а также вычислениями между этой передачей, и еще они меняют значения в моделях.
## Архитектура приложения 

Код приложения разделен на слои согласно парадигме MVP (Model-View-Presenter): 
- слой данных (Model - бизнес-логика), отвечает за хранение и изменение данных;
- слой представления (View), отвечает за отображение данных на странице;
- презентер (Presenter), отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. С его помощью можно отправлять HTTP-запросы: `GET`, `POST`, `PUT` и `DELETE`.\
Конструктор класса: `constructor(baseUrl: string, options: RequestInit = {})`\
 В конструктор передается базовый адрес сервера (`baseUrl`) и опциональный объект с заголовками запросов (`options`).

Методы, реализуемые классом: 

- `handleResponse(response: Response): Promise<object>` отвечает за обработку ответов сервера. Он может вернуть данные сервера в виде промиса (`Promise`) или отклонить ответ и сообщить об ошибке;
- `get(uri: string)` - принимает аргументом `(uri)` (относительный путь) и выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер;
- `post(uri: string, data: object, method: ApiPostMethods = 'POST')` - также как и в методе `get` принимает аргументом `(uri)`, а также  объект с данными `data`и метод запроса `method` имеющий тип `ApiPostMethods`. По умолчанию выполняется `POST` запрос, который отправляет эти данные на ендпоинт переданный как параметр при вызове метода, но метод запроса может быть переопределен заданием третьего параметра при вызове. 

#### Класс ShopApi
Расширяет базовый класс `Api` и реализует интерфейс:
```
interface IShopAPI {
	getProductList: () => Promise <IProduct[]>;
	getProductItem: (id: string) => Promise <IProduct>;
	orderProduct: (order: IOrder) => Promise <IOrderResult>;
}
```
Конструктор класса: `constructor(cdn: string, baseUrl: string, options?: RequestInit)`\
 В конструктор передается `CDN` - адрес для получения контента, базовый адрес сервера `baseUrl` и опциональный объект с заголовками запросов `options`.

Методы, реализуемые классом:
- `getProductsList(): Promise<IProduct[]>` - получение всего каталога товаров;
- `getProductItem(id: string): Promise<IProduct>` - получение данных о товаре по id;
- `orderProducts(order: IOrder): Promise<IOrderResult>` - отправка оформленного заказа.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.\
 Класс реализуется интерфейсом `IEvents`:
```
interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
```
Конструктор класса: `constructor() {this._events = new Map<EventName, Set<Subscriber>>()}` .\
Внутри себя класс инициализирует структуру данных `_events`, которая представляет собой коллекцию ключ/значение `Map`, где в качестве ключей выступают имена событий `EventName`, а в качестве значений - множество подписчиков `Set<Subscriber>`.

Методы, реализуемые классом:
- `on<T extends object>(eventName: EventName, callback: (event: T) => void)` - устанавливает обработчик на указанное событие.\
 Принимает имя события (`eventName`) и коллбэк-функцию (`callback`), которая будет вызвана при возникновении события;
- `off(eventName: EventName, callback: Subscriber)` - снимает обработчик c указанного события.\
Также принимает имя события (`eventName`) и коллбэк-функцию, которая была установлена с помощью метода `on`;
- `emit<T extends object>(eventName: string, data?: T)` - инициализация события с указанным именем (`eventName`) и опциональными данными (`data`);
- `onAll(callback: (event: EmitterEvent) => void)` - устанавливает обработчик на все события;\
В качестве аргумента принимает коллбэк-функцию, которая будет срабатывать при возникновении любого события;
- `offAll()` - удаляет все установленные обработчики;
- `trigger<T extends object>(eventName: string, context?: Partial<T>)` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие.

#### Класс Model`<T>`
  Класс `Model` представляет собой абстрактный базовый класс для моделей в приложении.\
  Конструктор класса: `constructor(data: Partial<T>, protected events: IEvents)`\
   В конструкторе принимает в качестве аргумента `data` данные `Partial<T>` и EvenEmmiter.
  
  Метод, реализуемый классом:
  - `emitChanges(event: string, payload?: object)` используется для уведомления о изменениях в модели.

#### Класс Component`<T>`
Класс является базовым для элементов отображения на странице.\
Конструктор класса: `constructor(protected readonly container: HTMLElement)`
В конструкторе принимает контейнер и EvenEmmiter.
Дженерик `T` представляет тип данных, который будет использоваться для отображения в интерфейсе.\
Методы, реализуемые классом:
- `toggleClass(element: HTMLElement, className: string, force?: boolean)` - добавляет или удаляет указанный класс;
- `setText(element: HTMLElement, value: unknown)` - устанавливает текстовое содержимое для указанного элемента;
- `setDisabled(element: HTMLElement, state: boolean)` - устанавливает или удаляет атрибут disabled для указанного элемента;
- `setHidden(element: HTMLElement)` - скрывает указанный элемент;
- `setVisible(element: HTMLElement)` - показывает указанный элемент;
- `setImage(element: HTMLImageElement, src: string, alt?: string)` - устанавливает источник изображения и альтернативный текст при наличии атрибута `alt` для указанного элемента;
- `render(data?: Partial<T>): HTMLElement` - возвращает корневой DOM-элемент.

### Общие компоненты

#### Класс Modal 
Расширяет базовый класс `Component` и отвечает за работу с модальными окнами.\
Конструктор класса: `constructor(container: HTMLElement, protected events: IEvents)`\
В конструкторе принимает контейнер и EvenEmmiter.\
Методы, реализуемые классом:
- `set content(value: HTMLElement)` - устанавливает переданные данные в свойство `content`;
- `open()` - открывает модальное окно, путем добавления соответствующего класса и отправляет событие `'modal:open'`;
- `close()` - закрывает модальное окно и отправляет событие `'modal:close'`; 
- `render(data: IModalData): HTMLElement` - используется для рендера модального окна.

#### Класс Form`<T>`
Как и предыдущий класс `Modal`, класс`Form<T>` расширяет базовый класс `Component`. Он представляет собой форму для работы с формой заказа.\
Конструктор класса: `constructor(protected container: HTMLFormElement, protected events: IEvents)`\
В конструкторе принимает контейнер и EvenEmmiter.\
Методы, реализуемые классом:
- `onInputChange(field: keyof T, value: string)` создается событие `'change'`, в котором передаются название измененного поля и его значение. 
- `valid(value: boolean)` устанавливает состояние доступности кнопки отправки формы в зависимости от валидности данных в форме;
- `errors(value: string)` - устанавливает ошибки; 
- `render(state: Partial<T> & IFormState)` отвечает за отрисовку формы.

### Слой представления

#### Класс PageView
Предназначен для отображения и управления элементами на странице сайта и расширяет базовый класс `Component` с интерфейсом:
```
interface IPage {
  counter: number;
  catalog: HTMLElement[];
  locked: boolean;
}
``` 
  Конструктор класса: `constructor(container: HTMLElement, protected events: IEvents)`\
В конструкторе принимает контейнер и EvenEmmiter.\
Внутри конструктора реализуются свойства: `_counter` - счетчик элементов в корзине, `_catalog` - галерея товаров, `_wrapper` - обертка страницы, `_basket` - кнопка для перехода в корзину, также ей устанавливается слушатель событий и при клике создается событие `'basket:open'` - открыть корзину.
Методы, реализуемые классом:
- `set counter(value: number)` - количество товаров в корзине;
- `set catalog(items: HTMLElement[])` - инициализирует каталог товаров;
- `set locked(value: boolean)` - блокировка/разблокировка страницы.

#### Класс CardView
Предназначен для отображения информации о товарах на странице сайта и расширяет базовый класс `Component` с интерфейсом:
```
interface IProduct {
	id: string;
    description: string;
    image: string;
	title: string;	
	category: CategoryOptions;
	price: number | null;
	isAddedToBasket?: boolean;
}
``` 
Конструктор класса: `constructor(blockName: string, container: HTMLElement, action?: IAction)`.
В конструкторе принимает название блока (контейнера), сам контейнер и необязательный аргумент `action` для настройки действий.

В конструкторе класса инициализируются: заголовок `_title`, цена `_price`, описание `_description`, изображение `_image`, категория `_category` и кнопка `_button`. Также происходит проверка наличия объекта `action`: в случае его наличия создается событие на кнопке, в противном случае событие присваивается блоку. Также с помощью методов `set` и `get` в классе осуществляется установка контента внутри блока. Метод `setCategoryColor` используется для определения цвета категории.

#### Класс CardPreview
Расширяет класс CardView. Данный класс служит для отображения карточки товара в модальном окне. Наследует все свойства и методы родительского класса, а также имеет метод `toggleButtonView` который меняет текст кнопки "В корзину"/"Убрать из корзины" в зависимости от наличии товара в корзине. 

#### Класс BasketView
Класс отвечает за отображение данных корзины и расширяет базовый класс `Component` с интерфейсом:
```
interface IBasketView{
    products: HTMLElement[];
    total: number;
}
```
Конструктор класса: `constructor(container: HTMLElement, events: IEvents)`\
В конструкторе принимает контейнер и EvenEmmiter.
Класс внутри конструктора объявляет: список товаров `_list`, общую сумму `_total` и кнопку оформления `_button`, на которую сразу вешается слушаетель, который при клике генерирует событие `order:open` - открытие модального окна с оформлением заказа.\
Методы, реализуемые классом:
- `set items(items: HTMLElement[])` - устанавливается список товаров;
- `set total(total: number)` - устанавливается сумма товаров к ворзине.

#### Класс OrderDeliveryFormView 
Расширяет класс `Form`. Данный класс отвечает за отображение модального окна ввода адреса и выбора способа оплаты.
Конструктор класса: `constructor(container: HTMLFormElement, events: IEvents)`\
В конструкторе принимает контейнер и EvenEmmiter. \
Методы, реализуемые классом:
- `set address(value: string)` - устанавливает значение адреса;
- `paymentSelection(method: PaymentOptions)` - устанавливает значение для способа оплаты.

#### Класс OrderContactFormView 
Расширяет класс `Form`. Данный класс отвечает за отображение модального окна ввода электронной почты и номера телефона.
Конструктор класса: `constructor(container: HTMLFormElement, events: IEvents)`\
В конструкторе принимает контейнер и EvenEmmiter.\
Методы, реализуемые классом:
- `set phone(value: string)` - устанавливает значение номера телефона;
- `set email(value: string)` - устанавливает адрес электронной почты.

#### Класс SuccessView
  Класс отвечает за вывод окна об успешном завершении заказа. Расширяет класс `Component` со следующим интерфейсом:
  
  ```
  interface IOrderResult {
   	total: number;
  }
  ```
 Конструктор класса: `constructor(container: HTMLElement, action: ISuccessActions)`\
В конструкторе принимает контейнер и действие action в качестве аргументов. 
Класс инициализирует кнопку `close`, отвечающую за закрытие модального окна.\
Метод, реализуемый классом:
- `set total(total: number)` для установки значения списанной суммы


### Слой данных

#### Класс Basket
  Расширяет класс `Model`. Отвечает за работу с данными корзины.\
  Интерфейс класса:
  
  ```
    type ProductBasket = Pick <IProduct,	'id' | 'title' | 'price'>;
  ```
  Данные о продуктах в корзине представлены массивом: `IProductBasket[]`

  Методы, реализуемые классом:
  - `getproductList()` - получает данные о товарах в корзине;
  - `addProduct(product: IProduct)` - добавляет товары и вызывает метод `updateProductList()`;
  - `removeProduct(product: IProduct)` - удаляет товары и вызывает метод `updateProductList()`;  
  - `updateProductList()` - создает событие 'basket:update' о том что корзина обновлена и передает в него массив данных;
  - `getTotal()` - получать общую сумму товаров в корзине;
  - `clearBasket()` - очищает корзину;
  - `getProductId(): string[]` - получает `id` товаров.

#### Класс Catalog
Расширяет класс `Model`. Отвечает за работу с каталогом сайта. Хранит данные о продуктах в виде массива `IProduct[]`.\
Метод, реализуемый классом:
- `setCatalog(catalog: IProduct[])` - принимает данные, обрабатывает их и создает событие `'catalog:updated'`.

#### Класс Order
Расширяет класс `Model`. Управляет данными во время оформления заказа.\
Интерфейс хранения информации о электронной почты и номера телефона:

  ```
  interface IOrderContact {
  	phone: string;
  	email: string;
  }
  ```
  Интерфейс хранения информации о способе оплаты и адресе:
  ```
  interface IOrderDelivery {
  	address: string;
  	payment: PaymentOptions;
  }
  ```
  Способ оплаты описан типом:
  ```
  type PaymentOptions = 'card' | 'cash';
  ```
  Интефейс содержащий общую сумму заказа и `id` товаров из корзины:
  ```
  type IOrderForm = Partial<IOrderContact> & Partial<IOrderDelivery>;

  interface IOrder extends IOrderForm {
  	total: number;
  	items: string[];
  }
  ```
  Методы, реализуемые классом:
  - `setDeliveryField` - принимает и устанавливает соответствующие значения в свойства способа оплаты и адрес;
  - `validateOrderDelivery` - осуществляет проверку данных способа оплаты и адреса;
  - `setContactField` - принимает и устанавливает соответствующие значения в свойства с данными телефона и электронной почты;
  - `validateOrderContact` - осуществляет проверку данных телефона и электронной почты.

  ### Основные типы и интерфейсы 
  #### interface IProduct
  Описывает информацию о товаре:
  ```
  interface IProduct {
	id: string;
  description: string;
  image: string;
	title: string;	
	category: CategoryOptions;
	price: number | null;
	isAddedToBasket?: boolean;
}
```
#### interface ICatalogData
Описывает данные о продуктах в каталоге:
```
interface ICatalogData {
	catalog: IProduct[];
}
```
#### interface IBasketData
Описывает данные о продуктах в корзине:
```
 interface IBasketData {
	basket: ProductBasket[];
}
```
#### type PaymentOptions
Способ оплаты описан типом:
```
 type PaymentOptions = 'card' | 'cash' | '';
 ```
 #### type CategoryOptions
Категории скилов карточек писаны типом:
 ```
 type CategoryOptions = 'софт-скил'	| 'другое' | 'дополнительное'	| 'кнопка'	| 'хард-скил';
 ```
#### interface IProduct
Тип, описывающий данные карточки на странички Превью
```
 type ProductBasket = Pick <IProduct,	'id' | 'title' | 'price' | 'isAddedToBasket'>;
 ```
#### interface IOrderContact
Интерфейс хранения информации о электронной почты и номера телефона:
```
 interface IOrderContact {
	phone: string;
	email: string;
}
```
#### interface IOrderDelivery
Интерфейс хранения информации о способе оплаты и адресе:
```
 interface IOrderDelivery {
	address: string;
	payment: PaymentOptions;
}
```
#### type IOrderForm
Тип описывает все данные формы заказа:
```
 type IOrderForm = Partial<IOrderContact> & Partial<IOrderDelivery>;
 ```
#### interface IOrder
Интефейс содержащий общую сумму заказа и `id` товаров из корзины:
```
 interface IOrder extends IOrderForm {
	total: number;
	items: string[];
}
```
#### type FormErrors
Тип для описания объекта, который может содержать ошибки формы.
```
 type FormErrors = Partial<Record<keyof IOrder, string>>;
 ```

#### interface IOrderResult
Описывает тип итоговой суммы при успешном заказе:
```
 interface IOrderResult {
	total: number;
}
```

#### interface ISuccessActions
Описывает возможные действия после покупки:
```
interface ISuccessActions {
  onClick: () => void;
}
```

#### interface IAction
Описывает возможные действия с карточкой товара:
```
interface IAction {
  onClick: (event: MouseEvent) => void;
}
```



#### Интерфейс IEvents
Описывает методы обработки событий:
```
interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
```
#### Интерфейс IShopAPI
Описывает методы работы с API:
```
interface IShopAPI {
  getProductList: () => Promise<IProduct[]>;
  getProductItem: (id: string) => Promise<IProduct>;
  orderProduct: (order: IOrder) => Promise<IOrderResult>;
}
```

#### Интерфейс IFormState
Описывает типы состояния полей формы:
```
interface IFormState {
  valid: boolean;
  errors: string[];
}
```

#### Интерфейс IBasketView
Описывает типы данных содержимого корзины:
```
interface IBasketView {
  items: HTMLElement[];
  total: number;
}
```

#### Интерфейс IModalData
Описывает тип данных модального окна:
```
interface IModalData {
    content: HTMLElement;
}
```

#### Интерфейс IPage
Описывает тип данных отображаемых на главной странице:
```
interface IPage {
  counter: number;
  catalog: HTMLElement[];
  locked: boolean;
}
```
#### Интерфейс ApiPostMethods
Описывает тип запросов:
```
type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';
```

#### Интерфейс ApiPostMethods
Описывает тип данных получаемых при запросе с сервера:
```
type ApiListResponse<Type> = {
    total: number,
    items: Type[]
};
```









