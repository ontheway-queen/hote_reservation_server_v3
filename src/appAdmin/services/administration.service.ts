import { Request } from "express";
import Lib from "../../utils/lib/lib";
import AbstractServices from "../../abstarcts/abstract.service";

class AdministrationService extends AbstractServices {
  constructor() {
    super();
  }

  public async createAdmin(req: Request) {
    const { password, ...rest } = req.body;
    const { hotel_code } = req.hotel_admin;
    const administrationModel = this.Model.rAdministrationModel();
    const check = await administrationModel.getSingleAdmin({
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

    // check if role exist
    const checkRole = await administrationModel.getSingleRoleByView({
      id: parseInt(req.body.role_id),
      hotel_code,
    });

    if (!checkRole) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Role not found",
      };
    }

    const res = await administrationModel.createAdmin({
      ...rest,
      hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  public async getAllAdmin(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, status, owner, search } = req.query;

    const { data, total } = await this.Model.rAdministrationModel().getAllAdmin(
      {
        hotel_code,
        limit: Number(limit as string),
        skip: Number(skip as string),
        status: status as string,
        owner: owner as string,
        search: search as string,
      }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getSingleAdmin(req: Request) {
    const { id } = req.params;
    const { hotel_code } = req.hotel_admin;

    const data = await this.Model.rAdministrationModel().getSingleAdmin({
      id: parseInt(id),
      hotel_code,
    });

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data[0],
    };
  }

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

    req.body["photo"] = files?.length && files[0].filename;

    await adminModel.updateAdmin(req.body, {
      id: parseInt(req.params.id),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  // get all permission
  public async getAllPermission(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const model = this.Model.rAdministrationModel();

    const { permissions } = await model.getHotelPermissionViewByHotel({
      hotel_code,
    });

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
      const { role_name, permissions } = req.body as {
        role_name: string;
        permissions: {
          h_permission_id: number;
          read: number;
          write: number;
          update: number;
          delete: number;
        }[];
      };

      const { id, hotel_code } = req.hotel_admin;
      const model = this.Model.rAdministrationModel(trx);

      // check role
      const checkRole = await model.getRoleByName(role_name, hotel_code);
      console.log({ checkRole });
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
        hotel_code,
        init_role: false,
        created_by: id,
      });

      const permissionIds = permissions.map(
        (item: any) => item.h_permission_id
      );

      const uniquePermissionIds = [...new Set(permissionIds)];

      // get all permission
      const checkAllPermission = await model.getHotelAllPermissionByHotel({
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
        role_id: Number;
        hotel_code: Number;
        h_permission_id: Number;
        read: number;
        write: number;
        update: number;
        delete: number;
        created_by?: Number;
      }[] = [];

      for (let i = 0; i < permissions.length; i++) {
        rolePermissionPayload.push({
          hotel_code,
          role_id: res[0].id,
          ...permissions[i],
          h_permission_id: permissions[i].h_permission_id,
          created_by: id,
        });
      }

      // insert role permission
      await model.insertInRolePermission(rolePermissionPayload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  public async getAllRole(req: Request) {
    const { data, total } = await this.Model.rAdministrationModel().getAllRole({
      hotel_code: req.hotel_admin.hotel_code,
      limit: Number(req.query.limit as string),
      skip: Number(req.query.skip as string),
      search: req.query.search as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getSingleRole(req: Request) {
    const { id } = req.params;
    const model = this.Model.rAdministrationModel();

    const data = await model.getSingleRoleByView({
      id: parseInt(id),
      hotel_code: req.hotel_admin.hotel_code,
    });

    const { permissions, ...rest } = data;
    const output_data: {
      permission_group_id: number;
      permission_group_name: string;
      subModules: {
        permission_id: number;
        h_permission_id: number;
        permission_name: string;
        read?: number;
        write?: number;
        update?: number;
        delete?: number;
      }[];
    }[] = [];
    console.log(data);

    permissions?.forEach((entry) => {
      const permissionGroupId = entry.permission_group_id;
      const permission = {
        permission_id: entry.permission_id,
        h_permission_id: entry.h_permission_id,
        permission_name: entry.permission_name,
        read: entry.read,
        write: entry.write,
        update: entry.update,
        delete: entry.delete,
      };

      const existingGroup = output_data.find(
        (group: any) => group.permission_group_id === permissionGroupId
      );

      if (existingGroup) {
        existingGroup.subModules.push(permission);
      } else {
        output_data.push({
          permission_group_id: permissionGroupId,
          permission_group_name: entry.permission_group_name,
          subModules: [permission],
        });
      }
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: { ...rest, permissions: output_data },
    };
  }

  public async updateSingleRole(req: Request) {
    const { id: role_id } = req.params;
    const { id: admin_id, hotel_code } = req.hotel_admin;
    const {
      role_name,
      update_permissions,
      deleted,
    }: { role_name: string; update_permissions: any[]; deleted: number[] } =
      req.body;
    const updated_permissions: any[] = [...new Set(update_permissions)];
    console.log("firstly", updated_permissions);

    return await this.db.transaction(async (trx) => {
      const model = this.Model.rAdministrationModel(trx);

      if (role_name) {
        // check role
        const checkRole = await model.getSingleRoleByView({
          id: parseInt(role_id),
          hotel_code,
        });

        if (!checkRole) {
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

      if (updated_permissions.length) {
        const updatePermissionIds = updated_permissions.map(
          (item: any) => item.h_permission_id
        );

        const uniquePermissionIds = [...new Set(updatePermissionIds)];

        // get all permission
        const checkAllPermission = await model.getHotelAllPermissionByHotel({
          ids: uniquePermissionIds,
          hotel_code,
        });

        if (checkAllPermission.length != uniquePermissionIds.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: "Permission ids are invalid",
          };
        }

        // check  if h_permission_id already exist in role permission
        const existingPermissions = await model.getRolePermissionByRole({
          hotel_code,
          role_id: parseInt(role_id),
          h_permission_ids: uniquePermissionIds,
        });

        const existingPermissionIds = existingPermissions.map(
          (item: any) => item.h_permission_id
        );

        // filter out not already existing permission
        const newPermission = uniquePermissionIds.filter(
          (id) => !existingPermissionIds.includes(id)
        );

        const newPermissionPayload: {
          role_id: Number;
          hotel_code: Number;
          h_permission_id: Number;
          read: number;
          write: number;
          update: number;
          delete: number;
          created_by?: Number;
        }[] = [];

        // new permission payload
        if (newPermission.length) {
          for (let i = 0; i < updated_permissions.length; i++) {
            if (
              newPermission.includes(updated_permissions[i].h_permission_id)
            ) {
              newPermissionPayload.push({
                hotel_code,
                role_id: parseInt(role_id),
                ...updated_permissions[i],
                h_permission_id: updated_permissions[i].h_permission_id,
                created_by: admin_id,
              });
            }
          }
        }

        // insert role permission
        newPermissionPayload.length &&
          (await model.insertInRolePermission(newPermissionPayload));

        const existingRolePermissionPayload: {
          h_permission_id: Number;
          read: number;
          write: number;
          update: number;
          delete: number;
        }[] = [];

        if (existingPermissionIds.length) {
          for (let i = 0; i < updated_permissions.length; i++) {
            if (
              existingPermissionIds.includes(
                updated_permissions[i].h_permission_id
              )
            ) {
              existingRolePermissionPayload.push({
                h_permission_id: updated_permissions[i].h_permission_id,
                read: updated_permissions[i].read,
                write: updated_permissions[i].write,
                update: updated_permissions[i].update,
                delete: updated_permissions[i].delete,
              });
            }
          }

          await Promise.all(
            existingRolePermissionPayload.map(async (item) => {
              await model.updateRolePermission(
                {
                  read: item.read,
                  write: item.write,
                  update: item.update,
                  delete: item.delete,
                  updated_by: admin_id,
                },
                Number(item.h_permission_id),
                Number(role_id),
                hotel_code
              );
            })
          );
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Role updated successfully",
      };
    });
  }
}

export default AdministrationService;
