export enum PAYMENT_TYPE {
  MFS = "MFS",
  SSL_COMMERCE = "SSL_COMMERCE",
  BRAC_BANK = "BRAC_BANK",
  PAYPAL = "PAYPAL",
  NGENIUS = "N_GENIUS",
  MAMO_PAY = "MAMO_PAY",
  SURJO_PAY = "SURJO_PAY",
}

export enum PAYMENT_CHARGE_TYPE {
  FLAT = "flat",
  PERCENTAGE = "percentage",
}

export interface IPaymentGatewaySettingPayload {
  title: string;
  type: (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];
  details: string;
  bank_charge: number;
  bank_charge_type: PAYMENT_CHARGE_TYPE;
  logo?: string;
  is_default?: 0 | 1;
  hotel_code: number;
  created_by: number;
}

export interface IUpdatePaymentGatewaySetting {
  details?: string;
  bank_charge?: number;
  logo?: string;
  bank_charge_type?: PAYMENT_CHARGE_TYPE;
  status?: 0 | 1;
  is_default?: 0 | 1;
}

export interface IPaymentGatewaySettingRequestBody {
  id: number;
  type: PAYMENT_TYPE;
  details: string;
}

export interface IGetPaymentGatewayQuery {
  type?: (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];
  status?: 0 | 1;
  is_default?: 0 | 1;
  id?: number;
  hotel_code: number;
}

export interface IGetPaymentGatewaySetting<T> {
  id: number;
  title: string;
  type: PAYMENT_TYPE;
  details: T;
  bank_charge: number;
  bank_charge_type: PAYMENT_CHARGE_TYPE;
  logo?: string;
  status: 0 | 1;
  hotel_code: number;
  created_by: number;
  created_id: number;
  updated_at: Date;
  created_by_name: string;
}

export interface INGeniusPaymentGatewayDetails {
  api_key: string;
  outlet_id: string;
  merchant_id: string;
}

export interface IMamoPaymentGatewayDetails {
  api_key: string;
  mode: "live" | "sandbox";
}

export interface INGeniusPaymentResponse {
  _links: {
    payment: {
      href: string;
    };
    cnp?: {
      href: string;
    };
  };
  reference: string;
  paymentUrl?: string;
  orderReference?: string;
  outletId: string;
  state: string;
  action: string;
  amount: {
    currencyCode: string;
    value: number;
  };
}

export interface IShurjoVerifyPayment {
  id: number;
  order_id: string;
  currency: string;
  amount: number;
  payable_amount: number;
  discount_amount: number;
  disc_percent: number;
  received_amount: number;
  usd_amt: number;
  usd_rate: number;

  method: string;
  customer_order_id: string;
  bank_status: string;
  invoice_no: string;
  bank_trx_id: string;
  sp_message: string; // response message
  sp_code: "1000" | "1001" | "1002";
  // 1000: Success
  // 1001: Declined by bank
  // 1002: Canceled by customer
  transaction_status: string;

  date_time: string;

  name: string;

  email: string;
  address: string;
  city: string;

  value1?: string;
  value2?: string;
  value3?: string;
  value4?: string;
}
