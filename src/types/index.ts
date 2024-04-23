export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: CategoryOptions;
	price: number | null;
	isAddedToBasket?: boolean;
	index: number;
}
export interface ICatalogData {
	catalog: IProduct[];
}

export interface IBasketData {
	basket: ProductBasket[];
}

export type PaymentOptions = 'card' | 'cash' | '';
export type CategoryOptions =
	| 'софт-скил'
	| 'другое'
	| 'дополнительное'
	| 'кнопка'
	| 'хард-скил';

export type ProductBasket = Pick<
	IProduct,
	'id' | 'title' | 'price' | 'index' | 'isAddedToBasket'
>;

export interface IOrderContact {
	phone: string;
	email: string;
}

export interface IOrderDelivery {
	address: string;
	payment: PaymentOptions;
}

export type IOrderForm = Partial<IOrderContact> & Partial<IOrderDelivery>;

export interface IOrder extends IOrderForm {
	total: number;
	items: string[];
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
	total: number;
}
