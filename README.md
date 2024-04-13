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

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP (Model-View-Presenter): 
- слой данных (Model - бизнес-логика), отвечает за хранение и изменение данных;
- слой представления (View), отвечает за отображение данных на странице;
- презентер (Presenter), отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. С его помощью можно отправлять HTTP-запросы: `GET`, `POST`, `PUT` и `DELETE`. В конструктор передается базовый адрес сервера (`baseUrl`) и опциональный объект с заголовками запросов (`options`).\
Имеет следующие методы: 
- Метод `handleResponse` отвечает за обработку ответов сервера. Он может вернуть данные сервера в виде промиса (`Promise`) или отклонить ответ и сообщить об ошибке;
- `get(uri: string)` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер;
- `post(uri: string, data: object, method: ApiPostMethods = 'POST')` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс ShopApi
Расширяет базовый класс `Api` и реализует интерфейс:
```
interface IShopAPI {
	getProductList: () => Promise <IProduct[]>;
	getProductItem: (id: string) => Promise <IProduct>;
	orderProduct: (order: IOrder) => Promise <IOrderResult>;
}
```
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

#### Класс Model 
  Класс `Model` представляет собой абстрактный базовый класс для моделей в приложении.\
  Имеет один метод:
  - `emitChanges(event: string, payload?: object)` используется для уведомления о изменениях в модели.

#### Класс Component
Класс является базовым для элементов отображения на странице. Дженерик внутри (`T`) представляет тип данных, который будет использоваться для отображения в интерфейсе. Принимает HTML-объект контейнера.\
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
Методы, реализуемые классом:
- `set content(value: HTMLElement)` - устанавливает переданные данные в свойство `content`;
- `open()` - открывает модальное окно, путем добавления соответствующего класса и отправляет событие `'modal:open'`;
- `close()` - закрывает модальное окно и отправляет событие `'modal:close'`; 
- `render(data: IModalData): HTMLElement` - используется для рендера модального окна.

#### Класс Form
Как и предыдущий класс `Modal`, `Form` расширяет базовый класс `Component`. Он представляет собой форму для работы с формой заказа.\
Методы, реализуемые классом:
- `onInputChange(field: keyof T, value: string)` создается событие `'change'`, в котором передаются название измененного поля и его значение. 
- `valid(value: boolean)` устанавливает состояние доступности кнопки отправки формы в зависимости от валидности данных в форме;
- `errors(value: string)` - устанавливает ошибки; 
- `render(state: Partial<T> & IFormState)` отвечает за отрисовку формы.

### Слой представления

#### Класс CardView
Предназначен для отображения информации о товарах на странице сайта и расширяет базовый класс `Component` с интерфейсом:
```
interface IProduct {
	id: string;
    description: string;
    image: string;
	title: string;	
	category: string;
	price: number | null;
}
``` 

#### Класс BasketView
Класс отвечает за отображение данных корзины и расширяет базовый класс `Component` с интерфейсом:
```
interface IBasketView{
    products: HTMLElement[];
    total: number;
}
```
Класс внутри конструктора объявляет: список товаров `list`, общую сумму `total` и кнопку оформления `buttonElement`.
С помощью методов `set` устанавливается список товаров`set products` и их сумма `set total`.

#### Класс OrderDeliveryView 
Расширяет класс `Form`.
Методы, реализуемые классом:
- `set address` - устанавливает значение адреса;
- `set payment` - устанавливает значение для способа оплаты.

#### Класс OrderContactView 
Расширяет класс `Form`.
Методы, реализуемые классом:
- `set phone` - устанавливает значение номера телефона;
- `set email` - устанавливает адрес электронной почты.

#### Класс SuccessView
  Класс отвечает за вывод окна об успешно пройденном заказе после оформления.Расширяет класс `Component` со следующим интерфейсом:
  
  ```
  interface IOrderResult {
   	total: number;
  }
  ```
Класс инициализирует одну кнопку `close`, отвечающую за закрытие модального окна и имеет метод `set total` для установки значения списанной суммы.



### Слой данных

#### Класс Product
Расширяет класс `Model`. Обеспечивает хранение и представление данных.\
Интрефейс класса:
  
```
interface IProduct {
	id: string;
    description: string;
    image: string;
	title: string;	
	category: string;
	price: number | null;
}
```

#### Класс Basket
  Расширяет класс `Model`. Отвечает за работу с данными корзины.\
  Интерфейс класса:
  
  ```
    type ProductBasket = Pick <IProduct,	'id' | 'title' | 'price'>;
  ```

  Методы, реализуемые классом:
  - `clearBasket` - очищает корзину;
  - `removeProduct` - удаляет товары;  
  - `addProduct` - добавляет товары;
  - `getTotalAmount` - получать общую сумму товаров в корзине;
  - `getProductIds` - получает `id` товаров.

Данные о продуктах корзины представлены в виде массива: `IProductBasket[]`

#### Класс Catalog
  Расширяет класс `Model`. Отвечает за работу с каталогом сайта. Хранит данные о продуктах в виде массива.\
  Интерфейс класса:
  
  ```
    interface ICatalogData {
	catalog: IProduct[];
}
  ```
#### Класс Order
  Расширяет класс `Model`. Управляет данными во время оформления заказа.\
  Интерфейс хранения информации о электронной почты и номера телефона:

  ```
  interface IOrderContact {
  	phone: string;
  	email: string;
  }
  ```
  Интерфейс хранения информацию о способе оплаты и адресе:
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
  - `validateDelivery` - осуществляет проверку данных способа оплаты и адреса;
  - `setContactField` - принимает и устанавливает соответствующие значения в свойства с данными телефона и электронной почты;
  - `validateContact` - осуществляет проверку данных телефона и электронной почты.
   