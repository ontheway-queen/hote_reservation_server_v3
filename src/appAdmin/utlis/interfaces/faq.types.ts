export interface ICreateFaqBody {
  faq_head_id: number;
  question: string;
  answer: string;
  order_number: number;
}

interface Faq {
  faq_id: number;
  question: string | null;
  answer: string | null;
  order_number: number;
  status: string;
}

export interface IFaqHeadsWithFaq {
  id: number;
  order_number: number;
  title: string;
  faqs: Faq[] | null;
}

export interface IgetSingleFaqHeads {
  id: number;
  hotel_code: number;
  title: string;
  order_number: number;
  status: string;
  created_at: Date;
}

export interface IgetFaqsByHeadId {
  id: number;
  question: string;
  answer: string;
  order_number: number;
  status: string;
  created_at: Date;
}
