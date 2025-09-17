import AbstractRouter from "../abstarcts/abstract.router";
import CommonInvRouter from "./routers/common.inv.router";
import InventoryRouter from "./routers/inventory.router";
import ProductInvRouter from "./routers/product.router";
import PurchaseInvRouter from "./routers/purchase.router";
import StockInvRouter from "./routers/stock.router";

class HotelInventoryRouter extends AbstractRouter {
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		// common
		this.router.use("/common", new CommonInvRouter().router);

		// product
		this.router.use("/product", new ProductInvRouter().router);

		// purchase
		this.router.use("/purchase", new PurchaseInvRouter().router);

		// stock
		this.router.use("/stock", new StockInvRouter().router);

		// inventory
		this.router.use("/inventory", new InventoryRouter().router);
	}
}
export default HotelInventoryRouter;
