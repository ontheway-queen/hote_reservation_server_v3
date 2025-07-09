import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";
import {
	ICreateInvPurchaseItemBody,
	ICreateInvPurchasePayload,
} from "../utils/interfaces/purchase.interface";

class PurchaseInvService extends AbstractServices {
	constructor() {
		super();
	}

	// create purchase
	public async createPurchase(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;
			const {
				purchase_date,
				supplier_id,
				ac_tr_ac_id,
				discount_amount,
				vat,
				shipping_cost,
				paid_amount,
				purchase_items,
				payment_type,
			} = req.body as ICreateInvPurchasePayload;

			// Check supplier
			const cmnInvModel = this.Model.CommonInventoryModel(trx);

			// Check account
			const accModel = this.Model.accountModel(trx);

			// Check purchase
			const pInvModel = this.Model.purchaseInventoryModel(trx);
			const pdModel = this.Model.productInventoryModel(trx);

			const checkSupplier = await cmnInvModel.getSingleSupplier(
				supplier_id,
				hotel_code
			);
			if (!checkSupplier) {
				throw new Error("Invalid Supplier Information");
			}
			const checkAccount = await accModel.getSingleAccount({
				hotel_code,
				id: ac_tr_ac_id,
			});
			if (!checkAccount.length) {
				throw new Error("Account not found");
			}

			// check purchase item exist or not
			const pdIds = purchase_items.map((item) => item.product_id);
			console.log({ pdIds });

			const { data: checkPd } = await pdModel.getAllProduct({
				pd_ids: pdIds,
				hotel_code,
			});
			console.log({ checkPd });
			if (pdIds.length != checkPd.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message: "Product id is invalid",
				};
			}

			const last_balance = checkAccount[0].last_balance;
			const sub_total = purchase_items.reduce(
				(acc, curr) => acc + curr.quantity * curr.price,
				0
			);
			console.log({ sub_total });
			const grand_total = parseFloat(
				Number.parseFloat(
					(
						sub_total +
						vat +
						shipping_cost -
						discount_amount
					).toString()
				).toFixed(2)
			);
			const due = grand_total - paid_amount;

			console.log({ checkAccount, grand_total });

			if (paid_amount > grand_total) {
				throw new Error(
					"Paid Amount cannot be greater than grand total"
				);
			}

			if (discount_amount > grand_total) {
				throw new Error(
					"Discount amount cannot be greater than grand total"
				);
			}
			if (last_balance < paid_amount) {
				throw new Error(
					"Insufficient balance in this account for payment"
				);
			}

			const year = new Date().getFullYear();

			// get last voucher ID
			const purchaseData = await pInvModel.getAllPurchaseForLastId();
			const payment_no = purchaseData.length ? purchaseData[0].id + 1 : 1;

			// Insert purchase
			const createdPurchase = await pInvModel.createPurchase({
				hotel_code,
				purchase_date,
				supplier_id,
				discount_amount,
				sub_total,
				grand_total,
				paid_amount,
				vat,
				shipping_cost,
				due,
				voucher_no: `PUR-${year}${payment_no}`,
			});

			console.log({ createdPurchase });

			// product name include in purchase items
			for (let i = 0; i < checkPd.length; i++) {
				for (let j = 0; j < purchase_items.length; j++) {
					if (checkPd[i].id == purchase_items[j].product_id) {
						purchase_items[j].product_name = checkPd[i].name;
					}
				}
			}

			// Insert purchase item
			const purchaseItemsPayload: ICreateInvPurchaseItemBody[] = [];

			for (const item of purchase_items) {
				const existingItem = purchaseItemsPayload.find(
					(p) => p.product_id === item.product_id
				);
				if (existingItem) {
					existingItem.quantity += item.quantity;
					existingItem.price += item.price * item.quantity;
				} else {
					purchaseItemsPayload.push({
						product_id: item.product_id,
						purchase_id: createdPurchase[0]?.id,
						price: item.price * item.quantity,
						quantity: item.quantity,
						product_name: item.product_name,
					});
				}
			}
			await pInvModel.createPurchaseItem(purchaseItemsPayload);

			// Inventory step
			const modifyInventoryProduct: {
				id: number;
				available_quantity: number;
			}[] = [];
			const addedInventoryProduct: {
				hotel_code: number;
				product_id: number;
				available_quantity: number;
			}[] = [];
			const purchase_product_ids = purchase_items.map(
				(item) => item.product_id
			);

			const getInventoryProduct = await pInvModel.getAllInventory({
				hotel_code,
				product_id: purchase_product_ids,
			});

			for (const payloadItem of purchaseItemsPayload) {
				const inventoryItem = getInventoryProduct.find(
					(g) => g.product_id === payloadItem.product_id
				);
				if (inventoryItem) {
					modifyInventoryProduct.push({
						available_quantity:
							parseFloat(inventoryItem.available_quantity) +
							payloadItem.quantity,
						id: inventoryItem.id,
					});
				} else {
					addedInventoryProduct.push({
						hotel_code,
						available_quantity: payloadItem.quantity,
						product_id: payloadItem.product_id,
					});
				}
			}

			// Insert in inventory
			if (addedInventoryProduct.length) {
				await pInvModel.insertInInventory(addedInventoryProduct);
			}

			if (modifyInventoryProduct.length) {
				await Promise.all(
					modifyInventoryProduct.map(async (item) => {
						await pInvModel.updateInInventory(
							{ available_quantity: item.available_quantity },
							{ id: item.id }
						);
					})
				);
			}

			// Insert supplier ledger
			// await pInvModel.insertInvSupplierLedger({
			// 	supplier_id,
			// 	hotel_code,
			// 	ledger_debit_amount: grand_total,
			// 	ledger_details: `Balance will be debited from hotel for sell something from supplier`,
			// });

			if (paid_amount > 0) {
				console.log({ ac_tr_ac_id });
				const a = await cmnInvModel.insertSupplierPayment({
					created_by: admin_id,
					hotel_code: hotel_code,
					purchase_id: createdPurchase[0]?.id,
					total_paid_amount: paid_amount,
					ac_tr_ac_id,
					payment_no,
					supplier_id,
					payment_type,
				});
				console.log({ a });
				// get last account ledger
				// const lastAL = await accModel.getLastAccountLedgerId(
				// 	hotel_code
				// );

				// const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
				// Insert account ledger
				// await accModel.insertAccountLedger({
				// 	ac_tr_ac_id,
				// 	hotel_code,
				// 	transaction_no: `PUR-${year}${payment_no}`,
				// 	ledger_debit_amount: paid_amount,
				// 	ledger_details: `Balance Debited by Purchase`,
				// });

				// Insert supplier ledger
				// await pInvModel.insertInvSupplierLedger({
				// 	ac_tr_ac_id,
				// 	supplier_id,
				// 	hotel_code,
				// 	ledger_credit_amount: paid_amount,
				// 	ledger_details: `Balance credited for sell something`,
				// });
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: "Purchase created successfully.",
			};
		});
	}

	// Get all Purchase
	public async getAllPurchase(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { limit, skip, key, supplier_id, due } = req.query;

		const model = this.Model.purchaseInventoryModel();

		const { data, total } = await model.getAllpurchase({
			key: key as string,
			limit: limit as string,
			skip: skip as string,
			by_supplier_id: parseInt(supplier_id as string),
			hotel_code,
			due: parseInt(due as string),
		});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	// Get Single Purchase
	public async getSinglePurchase(req: Request) {
		const { id } = req.params;
		const { hotel_code } = req.hotel_admin;

		const data =
			await this.Model.purchaseInventoryModel().getSinglePurchase(
				parseInt(id),
				hotel_code
			);
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data: data[0],
		};
	}

	// create purchase money reciept
	public async createPurchaseMoneyReciept(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { hotel_code, id: admin_id } = req.hotel_admin;

			const {
				ac_tr_ac_id,
				supplier_id,
				paid_amount,
				reciept_type,
				purchase_id,
				remarks,
			} = req.body;

			//   checking supplier
			const cmnInvModel = this.Model.CommonInventoryModel(trx);

			// Check account
			const accModel = this.Model.accountModel(trx);

			// Check purchase
			const pInvModel = this.Model.purchaseInventoryModel(trx);

			const checkSupplier = await cmnInvModel.getSingleSupplier(
				supplier_id,
				hotel_code
			);
			if (!checkSupplier.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "User not found",
				};
			}

			// const check account
			const accountModel = this.Model.accountModel(trx);

			const checkAccount = await accountModel.getSingleAccount({
				hotel_code,
				id: parseInt(ac_tr_ac_id),
			});

			if (!checkAccount.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_NOT_FOUND,
					message: "Account not found",
				};
			}

			// check invoice
			if (reciept_type === "invoice") {
				const checkSinglePurchase = await pInvModel.getSinglePurchase(
					purchase_id,
					hotel_code
				);

				console.log({ checkSinglePurchase });

				if (!checkSinglePurchase.length) {
					return {
						success: false,
						code: this.StatusCode.HTTP_NOT_FOUND,
						message: "Invoice not found with this user",
					};
				}

				const { due, grand_total, voucher_no, supplier_id } =
					checkSinglePurchase[0];
				console.log({ checkSinglePurchase });

				if (due == 0) {
					return {
						success: false,
						code: this.StatusCode.HTTP_BAD_REQUEST,
						message: "Already paid this invoice",
					};
				}

				if (paid_amount != due) {
					return {
						success: false,
						code: this.StatusCode.HTTP_BAD_REQUEST,
						message: "Invoice due and paid amount are not same",
					};
				}

				// get last account ledger
				const lastAL = await accountModel.getLastAccountLedgerId(
					hotel_code
				);

				const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
				const year = new Date().getFullYear();
				// Insert account ledger
				const ledgerRes = await accModel.insertAccountLedger({
					ac_tr_ac_id,
					hotel_code,
					transaction_no: `TRX-${year - ledger_id}`,
					ledger_debit_amount: paid_amount,
					ledger_details: `Balance Debited by Purchase`,
				});

				// Insert supplier ledger
				await pInvModel.insertInvSupplierLedger({
					ac_tr_ac_id,
					supplier_id,
					hotel_code,
					acc_ledger_id: ledgerRes[0],
					ledger_credit_amount: paid_amount,
					ledger_details: `Balance credited for sell something`,
				});

				// ================= update purchase ================ //

				const remainingBalance = due - paid_amount;

				await pInvModel.updatePurchase(
					{
						due: remainingBalance,
					},
					{ id: purchase_id }
				);
				const purchaseData = await pInvModel.getAllPurchaseForLastId();
				const payment_no = purchaseData.length
					? purchaseData[0].id + 1
					: 1;
				// insert in payment supplier
				await cmnInvModel.insertSupplierPayment({
					ac_tr_ac_id,
					created_by: admin_id,
					hotel_code: hotel_code,
					purchase_id,
					total_paid_amount: paid_amount,
					supplier_id,
					payment_no,
					payment_type: "bank",
				});
			} else {
				// overall payment step
				const { data: allPurchaseInvoiceByUser } =
					await pInvModel.getAllpurchase({
						hotel_code,
						by_supplier_id: supplier_id,
					});

				const unpaidInvoice: {
					id: number;
					grand_total: number;
					due: number;
					voucher_no: string;
				}[] = [];

				for (let i = 0; i < allPurchaseInvoiceByUser?.length; i++) {
					if (parseFloat(allPurchaseInvoiceByUser[i].due) !== 0) {
						unpaidInvoice.push({
							id: allPurchaseInvoiceByUser[i].id,
							grand_total:
								allPurchaseInvoiceByUser[i].grand_total,
							due: allPurchaseInvoiceByUser[i].due,
							voucher_no: allPurchaseInvoiceByUser[i].voucher_no,
						});
					}
				}
				if (!unpaidInvoice.length) {
					return {
						success: false,
						code: this.StatusCode.HTTP_NOT_FOUND,
						message: "No due invoice found",
					};
				}
				// total due amount
				let remainingPaidAmount = paid_amount;
				const paidingInvoice: {
					id: number;
					due: number;
					purchase_id: string;
					total_paid_amount: number;
				}[] = [];

				console.log({ unpaidInvoice });

				for (let i = 0; i < unpaidInvoice.length; i++) {
					if (remainingPaidAmount > 0) {
						if (paid_amount >= unpaidInvoice[i].due) {
							remainingPaidAmount =
								paid_amount - unpaidInvoice[i].due;
							paidingInvoice.push({
								id: unpaidInvoice[i].id,
								due:
									unpaidInvoice[i].due - unpaidInvoice[i].due,
								purchase_id,
								total_paid_amount: unpaidInvoice[i].due,
							});
						} else {
							remainingPaidAmount =
								paid_amount - unpaidInvoice[i].due;
							paidingInvoice.push({
								id: unpaidInvoice[i].id,
								due: unpaidInvoice[i].due - paid_amount,

								purchase_id,
								total_paid_amount:
									unpaidInvoice[i].due - paid_amount,
							});
						}
					}
				}

				// =============== update purchase ==============//
				await Promise.all(
					paidingInvoice.map(async (item) => {
						await pInvModel.updatePurchase(
							{ due: item.due },
							{ id: item.id }
						);
					})
				);

				const year = new Date().getFullYear();
				// get last account ledger
				const lastAL = await accountModel.getLastAccountLedgerId(
					hotel_code
				);

				const ledger_id = lastAL.length ? lastAL[0].ledger_id + 1 : 1;
				// Insert account ledger
				await accModel.insertAccountLedger({
					ac_tr_ac_id,
					hotel_code,
					transaction_no: `TRX-${year - ledger_id}`,
					ledger_debit_amount: paid_amount,
					ledger_details: `Balance Debited by purchase Money Reciept`,
				});

				// Insert supplier ledger
				await pInvModel.insertInvSupplierLedger({
					ac_tr_ac_id,
					supplier_id,
					hotel_code,
					ledger_credit_amount: paid_amount,
					ledger_details: `Balance credited by purchase Money Reciept`,
				});

				const purchaseData = await pInvModel.getAllPurchaseForLastId();
				const payment_no = purchaseData.length
					? purchaseData[0].id + 1
					: 1;
				// money recipet item
				await Promise.all(
					paidingInvoice.map(async (item) => {
						await cmnInvModel.insertSupplierPayment({
							created_by: admin_id,
							hotel_code,
							purchase_id: purchase_id[0],
							total_paid_amount: item.total_paid_amount,
							ac_tr_ac_id,
							supplier_id,
							payment_no,
							payment_type: "bank",
						});
					})
				);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: this.ResMsg.HTTP_SUCCESSFUL,
			};
		});
	}
}
export default PurchaseInvService;
