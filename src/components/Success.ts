import { IOrderResult } from "../types";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

interface ISuccessActions {
  onClick: () => void;
}

export class SuccessView extends Component<IOrderResult> {
  protected close: HTMLButtonElement;
  protected description: HTMLElement;

  constructor(container: HTMLElement, action: ISuccessActions) {
    super(container);

    this.close = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
    this.description = ensureElement<HTMLElement>('.order-success__description', this.container);

    
    if (action?.onClick) {
      this.close.addEventListener('click', action.onClick);
    }
  }
  set total(total: number) {
    this.setText(this.description, `Списано ${total} синапсов`)
  }
}