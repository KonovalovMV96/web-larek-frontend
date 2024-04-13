export interface IProduct {
	id: string;
  description: string;
  image: string;
	title: string;	
	category: string;
	price: number | null;
}
export interface ICatalogData {
	catalog: IProduct[];
}

export interface IBasketData {
	basket: IProductBasket[];
}

export type PaymentOptions = 'card' | 'cash';

export type IProductBasket = Pick <IProduct,	'id' | 'title' | 'price'>;

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

export interface IOrderResult {
	total: number;
}