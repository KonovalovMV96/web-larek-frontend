import { IOrderContact, IOrderDelivery, PaymentOptions } from "../types";
import { ensureAllElements } from "../utils/utils";
import { IEvents } from "./base/Events";
import { Form } from "./common/Form";

export class OrderContactFormView extends Form<IOrderContact>{
  constructor(container: HTMLFormElement, events: IEvents){
    super(container,events);
    this._submit.addEventListener('click', () => {
      this.events.emit('order.contacts:next')
    })
  }
  set phone(value: string) {
    (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
}

set email(value: string) {
    (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
}
protected onInputChange(field: keyof IOrderContact, value: string) {
  this.events.emit('order.contact:change', {
    field,
    value,
  });
}
}

export class OrderDeliveryFormView extends Form<IOrderDelivery>{
  protected _payment: HTMLButtonElement[];
  constructor(container: HTMLFormElement, events: IEvents){
    super(container,events);
    this._submit.addEventListener('click', () => {
      this.events.emit('order.delivery:next')
    })
    this._payment = ensureAllElements(
      '.order__buttons button',
      container
    );
    this._payment.forEach((button) => {
      button.addEventListener('click', (event) => {
        this.resetButtonStatus();
        button.classList.add('button_alt-active');
        const paymentMethod = (event.target as HTMLButtonElement).name;
				this.paymentSelection(paymentMethod as PaymentOptions);
      });
    });
  }

  resetButtonStatus() {
    if (this._payment) {
      this._payment.forEach((button) => {
        button.classList.remove('button_alt-active');
      });
    }
    }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
}

paymentSelection(method: PaymentOptions) {
  this.events.emit('order.delivery:change', {
    field: 'payment',
    value: method,
  });
}

protected onInputChange(field: keyof IOrderDelivery, value: string) {
  this.events.emit('order.delivery:change', {
    field,
    value,
  });
}
}
