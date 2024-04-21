import { createElement, ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/Events";

interface IBasketView {
  items: HTMLElement[];
  total: number;
}

export class BasketView extends Component<IBasketView> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);

    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._total = ensureElement<HTMLElement>('.basket__price', this.container);
    this._button = ensureElement<HTMLButtonElement>('.basket__button', this.container);
    
    this._button.addEventListener('click', () => {
      events.emit('order:open');
    });

    this.items = [];
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
      items.forEach((item, index) => {
        const itemIndex = item.querySelector('.basket__item-index');
        if (itemIndex) { itemIndex.textContent = (index + 1).toString(); }
      });
      this._list.replaceChildren(...items);
      this.setVisible(this._total);
      this.setDisabled(this._button, false);
    } else {
      this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
        textContent: 'Корзина пуста'
      }));
      this.setHidden(this._total);
      this.setDisabled(this._button, true);
    }
  }

  set total(total: number) {
    this.setText(this._total, total);
  }
}