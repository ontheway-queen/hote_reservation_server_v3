export interface IOrderInfo {
	lifeTimeSales: string;
	lifeTimeSalesCount: string;
	todaySales: string;
	todaySalesCount: string;
	weeklySales: string;
	weeklySalesCount: string;
	monthlySales: string;
	monthlySalesCount: string;
	yearlySales: string;
	yearlySalesCount: string;
}

export interface ISellingItems {
	item_food_id: number;
	product_name: string;
	product_retail_price: string;
	food_category_name: string;
	total_quantity: string;
	daily_quantity: string;
	weekly_quantity: string;
}
