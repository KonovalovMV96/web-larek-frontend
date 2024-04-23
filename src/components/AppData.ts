import { FormErrors, IBasketData, IOrder, IOrderForm, IProduct, PaymentOptions, ProductBasket } from "../types";
import { emailRegex, phoneRegex } from "../utils/utils";
import { Model } from "./base/Model";

export class Catalog extends Model<IProduct> {
  catalogList: IProduct[] = [];

  setCatalog(catalog: IProduct[]) {
    this.catalogList = catalog.map((product) => ({ ...product, isAddedToBasket: false }));
    this.emitChanges('catalog:updated', { catalog: this.catalogList });
  }
}

export class Basket extends Model<ProductBasket> {
  productList: ProductBasket[] = [];

  getproductList(): IBasketData {
    return { basket: this.productList }
  }

  addProduct(product: IProduct) {
    const productIndex = this.productList.findIndex((item) => item.id === product.id);
    if (productIndex === -1) {
      this.productList.push(product);
    }
    this.updateProductList();
  }

  removeProduct(product: IProduct) {
    const productId = product.id;
    this.productList = this.productList.filter((product) => {
      return product.id !== productId;
    })
    this.updateProductList();
  }

  updateProductList() {
    this.events.emit('basket:update', this.productList)
  }

  getTotal() {
		return this.productList.reduce((total, product) => {
			return total + product.price;
		}, 0);
	}

  clearBasket() {
    this.productList = [];
  }

  getProductId(): string[] {
		return this.productList.map((product) => product.id);
	}
}

export class Order extends Model<IOrder> {
  order: IOrderForm = {
    phone: '',
	  email: '',
    address: '',
	  payment: '',
};
  total?: number;
	items?: string[];
  formErrors: FormErrors={};

  clearOrder(){
    this.order.phone= '';
	  this.order.email= '';
    this.order.address= '';
	  this.order.payment= '';
  }
  
  setDeliveryField(
		field: keyof IOrderForm,
		value: IOrderForm[keyof IOrderForm]
	) {
		if (field === 'payment') {
			this.order[field] = value as PaymentOptions;
		}
		if (field === 'address') {
			this.order[field] = value;
		}

		if (this.validateOrderDelivery()) {
			this.events.emit('order.delivery:ready', this.order);
		}
	}

  validateOrderDelivery() {
    const errors: typeof this.formErrors = {};
    if (!this.order.address) {
        errors.address = 'Необходимо указать адрес';
    }
    if (!this.order.payment) {
        errors.payment = 'Необходимо указать способ оплаты';
    }
    this.formErrors = errors;
    this.events.emit('formErrors:change:Delivery', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  setContactField(
		field: keyof IOrderForm,
		value: IOrderForm[keyof IOrderForm]
	) {
		if (field !== 'payment') {
			this.order[field] = value;
		}

		if (this.validateOrderContact()) {
			this.events.emit('order.contact:ready', this.order);
		}
	}

  validateOrderContact() {
    const errors: typeof this.formErrors = {};
    if (!this.order.email) {
        errors.email = 'Необходимо указать email';
    } else if (!emailRegex.test(this.order.email)) {
			errors.email = 'Проверьте корректность введеного email';
		}
    if (!this.order.phone) {
        errors.phone = 'Необходимо указать телефон';
    }else if (!phoneRegex.test(this.order.phone)) {
			errors.phone = 'Введите номер телефона в формате +7(ХХХ)ХХХ-ХХ-ХХ'; 
		}
    this.formErrors = errors;
    this.events.emit('formErrors:change:Contact', this.formErrors);
    return Object.keys(errors).length === 0;
  }

}