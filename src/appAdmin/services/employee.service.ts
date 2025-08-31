import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import {
	IcreateEmployeeReqBody,
	IupdateEmployeeReqBody,
} from "../utlis/interfaces/hr.interface";

export class EmployeeService extends AbstractServices {
	constructor() {
		super();
	}

	public async createEmployee(req: Request) {
		const { hotel_code, id } = req.hotel_admin;
		const { department_ids, designation_id, ...rest } =
			req.body as IcreateEmployeeReqBody;

		return await this.db.transaction(async (trx) => {
			const files = (req.files as Express.Multer.File[]) || [];

			if (files.length) {
				rest["photo"] = files[0].filename;
			}

			const hrModel = this.Model.hrModel(trx);

			const { total } = await hrModel.getAllDepartment({
				ids: department_ids,
				hotel_code,
			});

			console.log({ total });

			if (total !== department_ids.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_BAD_REQUEST,
					message: "Department not found from given id",
				};
			}
			const { data } = await hrModel.getAllEmployee({
				key: rest.email,
				hotel_code,
			});

			if (data.length) {
				return {
					success: false,
					code: this.StatusCode.HTTP_CONFLICT,
					message: "Employee already exist",
				};
			}

			const [insertRes] = await hrModel.insertEmployee({
				...rest,
				hotel_code,
				designation_id,
				created_by: id,
			});

			// insert into employee_departments
			await hrModel.insertIntoEmpDepartment(
				department_ids.map((dept_id) => ({
					emp_id: insertRes.id,
					department_id: dept_id,
				}))
			);

			return {
				success: true,
				code: this.StatusCode.HTTP_SUCCESSFUL,
				message: this.ResMsg.HTTP_SUCCESSFUL,
			};
		});
	}

	public async getAllEmployee(req: Request) {
		const { hotel_code } = req.hotel_admin;
		const { key, designation_id, department_id, status } = req.query;

		const { data, total } = await this.Model.employeeModel().getAllEmployee(
			{
				key: key as string,
				hotel_code,
				department: department_id as string,
				designation: designation_id as string,
				status: status as string,
			}
		);

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			total,
			data,
		};
	}

	public async getSingleEmployee(req: Request) {
		const { id } = req.params;
		const { hotel_code } = req.hotel_admin;

		const data = await this.Model.employeeModel().getSingleEmployee(
			parseInt(id),
			hotel_code
		);

		if (!data) {
			return {
				success: false,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: this.ResMsg.HTTP_NOT_FOUND,
			};
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async updateEmployee(req: Request) {
		const { hotel_code, id } = req.hotel_admin;
		const { new_department_ids, remove_department_ids, ...rest } =
			req.body as Partial<IupdateEmployeeReqBody>;

		console.log(req.body);

		const emp_id = Number(req.params.id);

		return await this.db.transaction(async (trx) => {
			const files = (req.files as Express.Multer.File[]) || [];

			if (files.length) {
				rest["photo"] = files[0].filename;
			}

			const hrModel = this.Model.hrModel(trx);

			if (new_department_ids?.length) {
				const { total } = await hrModel.getAllDepartment({
					ids: new_department_ids,
					hotel_code,
				});

				console.log({ total });

				if (total !== new_department_ids.length) {
					return {
						success: false,
						code: this.StatusCode.HTTP_BAD_REQUEST,
						message: "Department not found from given id",
					};
				}

				const alreadyHasDeptId =
					await hrModel.hasEmpDepartmentAlreadyExist(
						emp_id,
						new_department_ids
					);

				let uniqueIds: number[] = [];

				if (alreadyHasDeptId.length) {
					new_department_ids.forEach((id) => {
						const found = alreadyHasDeptId.find(
							(item) => item.department_id == id
						);

						if (!found) {
							uniqueIds.push(id);
						}
					});
				} else {
					uniqueIds = new_department_ids;
				}

				await hrModel.insertIntoEmpDepartment(
					uniqueIds.map((dept_id) => ({
						emp_id,
						department_id: dept_id,
					}))
				);
			}

			if (remove_department_ids?.length) {
				await hrModel.removeDepartmentFromEmployee(
					emp_id,
					remove_department_ids.map((dept_id) => dept_id)
				);
			}

			if (Object.keys(rest).length) {
				await hrModel.updateEmployee(emp_id, rest);
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}

	public async deleteEmployee(req: Request) {
		const { id } = req.params;

		await this.Model.employeeModel().deleteEmployee(parseInt(id));

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: "Employee has been deleted",
		};
	}

	public async getEmployeesByDepartmentId(req: Request) {
		const id = req.params.id;
		const { limit, skip } = req.query;
		const model = this.Model.employeeModel();

		const res = await model.getEmployeesByDepartmentId({
			id: Number(id),
			limit: Number(limit),
			skip: Number(skip),
		});
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			...res,
		};
	}
}
export default EmployeeService;
