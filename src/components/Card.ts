import { CategoryOptions, IProduct } from '../types';
import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';

interface IAction {
	onClick: (event: MouseEvent) => void;
}

export class CardView extends Component<IProduct> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _button?: HTMLButtonElement;
	protected _description?: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _category?: HTMLElement;
	protected _index: HTMLElement;

	constructor(blockName: string, container: HTMLElement, action?: IAction) {
		super(container);
		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
		this._description = container.querySelector(`.${blockName}__text`);
		this._image = container.querySelector(`.${blockName}__image`);
		this._category = container.querySelector(`.${blockName}__category`);
		this._button = container.querySelector(`.${blockName}__button`);
		this._index = container.querySelector('.basket__item-index');

		if (action?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', action.onClick);
			} else {
				this.container.addEventListener('click', action.onClick);
			}
		}
	}

	set index(value: number) {
		this.setText(this._index, value);
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent;
	}

	set price(value: number) {
		if (value) {
			this.setText(this._price, `${value} синапсов`);
		} else {
			this.setText(this._price, `Бесценно`);
		}
	}

	get priced(): string {
		return this._price.textContent;
	}

	set image(src: string) {
		this.setImage(this._image, src, this.title);
	}

	setCategoryColor(category: CategoryOptions): string {
		switch (category) {
			case 'софт-скил':
				return 'card__category_soft';
			case 'другое':
				return 'card__category_other';
			case 'дополнительное':
				return 'card__category_additional';
			case 'кнопка':
				return 'card__category_button';
			case 'хард-скил':
				return 'card__category_hard';
			default:
				return 'card__category_other';
		}
	}

	set category(category: CategoryOptions) {
		this.toggleClass(this._category, this.setCategoryColor(category));
		this.setText(this._category, category);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}
}

export class CardPreview extends CardView {
	protected _isAddedToBasket: boolean;
	constructor(blockName: string, container: HTMLElement, action?: IAction) {
		super(blockName, container, action);
		if (this._button) {
			this._button.addEventListener('click', () => {
				this.isAddedToBasket = !this.isAddedToBasket;
			});
		}
	}

	set isAddedToBasket(value: boolean) {
		this.toggleButtonView(value);
		this._isAddedToBasket = value;
	}

	get isAddedToBasket(): boolean {
		return this._isAddedToBasket;
	}

	toggleButtonView(value: boolean) {
		if (value) {
			this.setText(this._button, 'Убрать из корзины');
		} else if (this.priced === 'Бесценно') {
			this.setText(this._button, 'Нельзя купить');
			this.setDisabled(this._button, true);
		} else this.setText(this._button, 'В корзину');
	}
}
