import { IOrder, IOrderResult, IProduct } from "../types";
import { Api, ApiListResponse } from "./base/Api";

interface IShopAPI {
  getProductList: () => Promise<IProduct[]>;
  getProductItem: (id: string) => Promise<IProduct>;
  orderProduct: (order: IOrder) => Promise<IOrderResult>;
}

export class ShopAPI extends Api implements IShopAPI {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getProductList(): Promise<IProduct[]> {
    return this.get('/product').then((data: ApiListResponse<IProduct>) => {
      return data.items.map((item) => ({
        ...item,
        image: this.cdn + item.image,
      }))
    });
  }

  getProductItem(id: string): Promise<IProduct> {
    return this.get(`/lot/${id}`).then(
      (item: IProduct) => ({
        ...item,
        image: this.cdn + item.image,
      }));
  }

  orderProduct(order: IOrder): Promise<IOrderResult> {
    return this.post('/order', order).then(
      (data: IOrderResult) => data
    );
  }
}