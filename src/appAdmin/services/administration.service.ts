import { Request } from "express";
import Lib from "../../utils/lib/lib";
import AbstractServices from "../../abstarcts/abstract.service";

class AdministrationService extends AbstractServices {
  constructor() {
    super();
  }

  // create admin
  public async createAdmin(req: Request) {
    const { password, ...rest } = req.body;
    const { hotel_code } = req.hotel_admin;
    const mUserAdminModel = this.Model.rAdministrationModel();
    const check = await mUserAdminModel.getSingleAdmin({
      email: req.body.email,
    });

    if (check.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: "Email already exist",
      };
    }
    const files = (req.files as Express.Multer.File[]) || [];

    rest["password"] = await Lib.hashPass(password);

    if (files.length) {
      rest["avatar"] = files[0].filename;
    }

    const res = await mUserAdminModel.insertUserAdmin({ ...rest, hotel_code });

    if (res.length) {
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    }

    return {
      success: false,
      code: this.StatusCode.HTTP_BAD_REQUEST,
      message: this.ResMsg.HTTP_BAD_REQUEST,
    };
  }

  // update admin
  public async updateAdmin(req: Request) {
    const adminModel = this.Model.rAdministrationModel();
    const check = await adminModel.getSingleAdmin({
      id: parseInt(req.params.id),
    });

    if (!check.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const files = (req.files as Express.Multer.File[]) || [];

    req.body["avatar"] = files?.length && files[0].filename;

    await adminModel.updateAdmin(req.body, {
      id: parseInt(req.params.id),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  // get all admin
  public async getAllAdmin(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, status } = req.query;

    const model = this.Model.rAdministrationModel();

    const { data, total } = await model.getAllAdmin({
      hotel_code,
      limit: limit as string,
      skip: skip as string,
      status: status as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      total,
      data,
    };
  }

  // get all permission
  public async getAllPermission(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const model = this.Model.rAdministrationModel();
    const data = await model.getAllHotelPermissions({ hotel_code });

    const { permissions } = data[0];

    const groupedPermissions: any = {};

    permissions.forEach((entry: any) => {
      const permission_group_id = entry.permission_group_id;
      const permission = {
        permission_id: entry.permission_id,
        permission_name: entry.permission_name,
        h_permission_id: entry.h_permission_id,
      };

      if (!groupedPermissions[permission_group_id]) {
        groupedPermissions[permission_group_id] = {
          permission_group_id: permission_group_id,
          permissionGroupName: entry.permission_group_name,
          permissions: [permission],
        };
      } else {
        groupedPermissions[permission_group_id].permissions.push(permission);
      }
    });

    const result = Object.values(groupedPermissions);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: result,
    };
  }

  // create role
  public async createRole(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { role_name, permissions } = req.body;
      const { id, hotel_code } = req.hotel_admin;
      const model = this.Model.rAdministrationModel(trx);

      // check role
      const checkRole = await model.getRoleByName(role_name, hotel_code);

      if (checkRole.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Already exist",
        };
      }

      // insert role
      const res = await model.createRole({
        name: role_name,
        hotel_code: 12,
      });

      const permissionIds = permissions.map(
        (item: any) => item.h_permission_id
      );

      const uniquePermissionIds = [...new Set(permissionIds)];

      // get all permission
      const checkAllPermission = await model.getAllHotelPermission({
        ids: permissionIds,
        hotel_code,
      });

      if (checkAllPermission.length != uniquePermissionIds.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Permission ids are invalid",
        };
      }

      const rolePermissionPayload: {
        hotel_code: number;
        role_id: number;
        h_permission_id: number;
        permission_type: "read" | "write" | "update" | "delete";
        created_by: number;
      }[] = [];

      for (let i = 0; i < permissions.length; i++) {
        rolePermissionPayload.push({
          hotel_code,
          h_permission_id: permissions[i].h_permission_id,
          role_id: res[0],
          permission_type: permissions[i].permission_type,
          created_by: id,
        });
      }

      // insert role permission
      await model.createRolePermission(rolePermissionPayload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  // get role
  public async getRole(req: Request) {
    const model = this.Model.rAdministrationModel();

    const data = await model.getAllRole(req.hotel_admin.hotel_code);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
  // get single role
  public async getSingleRole(req: Request) {
    const { id } = req.params;
    const model = this.Model.rAdministrationModel();

    const data = await model.getSingleRole(
      parseInt(id),
      req.hotel_admin.hotel_code
    );

    const { permissions, ...rest } = data[0];
    const output_data: any = [];

    for (let i = 0; i < permissions?.length; i++) {
      let found = false;

      for (let j = 0; j < output_data.length; j++) {
        if (
          permissions[i].permission_group_id ==
          output_data[j].permission_group_id
        ) {
          let found_sub = false;
          for (let k = 0; k < output_data[j].subModules.length; k++) {
            if (
              output_data[j].subModules[k].permission_id ==
              permissions[i].permission_id
            ) {
              output_data[j].subModules[k].permission_type.push(
                permissions[i].permission_type
              );
              found_sub = true;
            }
          }
          if (!found_sub) {
            output_data[j].subModules.push({
              permission_id: permissions[i].permission_id,
              h_permission_id: permissions[i].h_permission_id,
              permission_name: permissions[i].permission_name,
              permission_type: [permissions[i].permission_type],
            });
          }

          found = true;
        }
      }

      if (!found) {
        output_data.push({
          permission_group_id: permissions[i].permission_group_id,
          permission_group_name: permissions[i].permission_group_name,
          subModules: [
            {
              permission_id: permissions[i].permission_id,
              h_permission_id: permissions[i].h_permission_id,
              permission_name: permissions[i].permission_name,
              permission_type: [permissions[i].permission_type],
            },
          ],
        });
      }
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: { ...rest, permission: output_data },
    };
  }

  public async updateSingleRole(req: Request) {
    const { id: role_id } = req.params;
    const { id: admin_id, hotel_code } = req.hotel_admin;
    const {
      role_name,
      added,
      deleted,
    }: { role_name: string; added: any[]; deleted: number[] } = req.body;
    const newPermission: any[] = [...new Set(added)];
    const deletedPermission: number[] = [...new Set(deleted)];

    return await this.db.transaction(async (trx) => {
      const model = this.Model.rAdministrationModel(trx);

      if (role_name) {
        // check role
        const checkRole = await model.getSingleRole(
          parseInt(role_id),
          hotel_code
        );

        if (!checkRole.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "role not found",
          };
        }
        await model.updateSingleRole(
          parseInt(role_id),
          {
            name: role_name,
          },
          hotel_code
        );
      }

      // ================== new permission added step ================= //

      if (newPermission.length) {
        const addedPermissionIds = newPermission.map(
          (item: any) => item.h_permission_id
        );

        const uniquePermissionIds = [...new Set(addedPermissionIds)];

        // get all permission
        const checkAllPermission = await model.getAllHotelPermission({
          ids: addedPermissionIds,
          hotel_code,
        });

        if (checkAllPermission.length != uniquePermissionIds.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "Permission ids are invalid",
          };
        }

        const rolePermissionPayload: {
          hotel_code: number;
          role_id: number;
          h_permission_id: number;
          permission_type: "read" | "write" | "update" | "delete";
        }[] = [];

        for (let i = 0; i < newPermission.length; i++) {
          rolePermissionPayload.push({
            hotel_code,
            h_permission_id: newPermission[i].h_permission_id,
            role_id: parseInt(role_id),
            permission_type: newPermission[i].permission_type,
          });
        }

        // insert role permission
        await model.createRolePermission(rolePermissionPayload);
      }

      // ===================  delete permission step ============= //

      if (deletedPermission.length) {
        await Promise.all(
          deletedPermission.map(async (item: any) => {
            await model.deleteRolePermission(
              item.h_permission_id,
              item.permission_type,
              parseInt(role_id)
            );
          })
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Role updated successfully",
      };
    });
  }

  // get admin role
  public async getAdminRole(req: Request) {
    const { id: admin_id } = req.hotel_admin;

    const model = this.Model.rAdministrationModel();

    const res = await model.getAdminRolePermission({ id: admin_id });

    const { id, name, role_id, role_name, permissions } = res[0];

    const moduleObject: any = {};

    for (const permission of permissions) {
      const moduleId = permission.permission_group_id;

      if (moduleObject[moduleId]) {
        moduleObject[moduleId].subModule.push({
          permissionId: permission.permission_id,
          permissionName: permission.permission_name,
          permissionType: permission.permission_type,
        });
      } else {
        moduleObject[moduleId] = {
          moduleId,
          module: permission.permission_group_name,
          subModule: [
            {
              permissionId: permission.permission_id,
              permissionName: permission.permission_name,
              permissionType: permission.permission_type,
            },
          ],
        };
      }
    }

    const data = Object.values(moduleObject);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: { id, name, role_id, role_name, permissionList: data },
    };
  }
}

export default AdministrationService;
