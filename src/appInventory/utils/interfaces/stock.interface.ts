export interface ICreateStockInBody {
  hotel_code: number;
  // ac_tr_id: number;
  ac_tr_ac_id: number;
  paid_amount: number;
  note: string;
  status: string;
}

export interface ICreateStockOutBody {
  hotel_code: number;
  note: string;
  status: string;
}

export interface ICreateStockPayload {
  stock_in: number;
  stock_out: number;
  ac_tr_ac_id: number;
  paid_amount: number;
  note: string;
  stock_items: ICreateStockItemBody[];
}

export interface ICreateStockItemBody {
  stock_id: number;
  product_id: number;
  quantity: number;
}
