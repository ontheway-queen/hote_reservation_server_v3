import { Request } from "express";
import Lib from "../../utils/lib/lib";
import AbstractServices from "../../abstarcts/abstract.service";

class AdministrationService extends AbstractServices {
  constructor() {
    super();
  }

  // // create admin
  // public async createAdmin(req: Request) {
  //   const { password, ...rest } = req.body;
  //   const { hotel_code } = req.hotel_admin;
  //   const mUserAdminModel = this.Model.rAdministrationModel();
  //   const check = await mUserAdminModel.getSingleAdmin({
  //     email: req.body.email,
  //   });

  //   if (check.length) {
  //     return {
  //       success: false,
  //       code: this.StatusCode.HTTP_CONFLICT,
  //       message: "Email already exist",
  //     };
  //   }
  //   const files = (req.files as Express.Multer.File[]) || [];

  //   rest["password"] = await Lib.hashPass(password);

  //   if (files.length) {
  //     rest["avatar"] = files[0].filename;
  //   }

  //   const res = await mUserAdminModel.insertUserAdmin({ ...rest, hotel_code });

  //   if (res.length) {
  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_SUCCESSFUL,
  //       message: this.ResMsg.HTTP_SUCCESSFUL,
  //     };
  //   }

  //   return {
  //     success: false,
  //     code: this.StatusCode.HTTP_BAD_REQUEST,
  //     message: this.ResMsg.HTTP_BAD_REQUEST,
  //   };
  // }

  // // update admin
  // public async updateAdmin(req: Request) {
  //   const adminModel = this.Model.rAdministrationModel();
  //   const check = await adminModel.getSingleAdmin({
  //     id: parseInt(req.params.id),
  //   });

  //   if (!check.length) {
  //     return {
  //       success: false,
  //       code: this.StatusCode.HTTP_NOT_FOUND,
  //       message: this.ResMsg.HTTP_NOT_FOUND,
  //     };
  //   }

  //   const files = (req.files as Express.Multer.File[]) || [];

  //   req.body["avatar"] = files?.length && files[0].filename;

  //   await adminModel.updateAdmin(req.body, {
  //     id: parseInt(req.params.id),
  //   });

  //   return {
  //     success: true,
  //     code: this.StatusCode.HTTP_SUCCESSFUL,
  //     message: this.ResMsg.HTTP_SUCCESSFUL,
  //   };
  // }

  // // get all admin
  // public async getAllAdmin(req: Request) {
  //   const { hotel_code } = req.hotel_admin;
  //   const { limit, skip, status } = req.query;

  //   const { data, total } = await this.Model.rAdministrationModel().getAllAdmin(
  //     {
  //       hotel_code,
  //       limit: limit as string,
  //       skip: skip as string,
  //       status: status as string,
  //     }
  //   );

  //   return {
  //     success: true,
  //     code: this.StatusCode.HTTP_SUCCESSFUL,
  //     total,
  //     data,
  //   };
  // }

  // // get all permission
  // public async getAllPermission(req: Request) {
  //   const { hotel_code } = req.hotel_admin;

  //   const model = this.Model.rAdministrationModel();
  //   const data = await model.getAllHotelPermissions({ hotel_code });

  //   const { permissions } = data[0];

  //   const groupedPermissions: any = {};

  //   permissions.forEach((entry: any) => {
  //     const permission_group_id = entry.permission_group_id;
  //     const permission = {
  //       permission_id: entry.permission_id,
  //       permission_name: entry.permission_name,
  //       h_permission_id: entry.h_permission_id,
  //     };

  //     if (!groupedPermissions[permission_group_id]) {
  //       groupedPermissions[permission_group_id] = {
  //         permission_group_id: permission_group_id,
  //         permissionGroupName: entry.permission_group_name,
  //         permissions: [permission],
  //       };
  //     } else {
  //       groupedPermissions[permission_group_id].permissions.push(permission);
  //     }
  //   });

  //   const result = Object.values(groupedPermissions);

  //   return {
  //     success: true,
  //     code: this.StatusCode.HTTP_OK,
  //     data: result,
  //   };
  // }

  // // create role
  // public async createRole(req: Request) {
  //   return await this.db.transaction(async (trx) => {
  //     const { role_name, permissions } = req.body;
  //     const { id, hotel_code } = req.hotel_admin;
  //     const model = this.Model.rAdministrationModel(trx);

  //     // check role
  //     const checkRole = await model.getRoleByName(role_name, hotel_code);

  //     if (checkRole.length) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_BAD_REQUEST,
  //         message: "Already exist",
  //       };
  //     }

  //     // insert role
  //     const res = await model.createRole({
  //       name: role_name,
  //       hotel_code: 12,
  //     });

  //     const permissionIds = permissions.map(
  //       (item: any) => item.h_permission_id
  //     );

  //     const uniquePermissionIds = [...new Set(permissionIds)];

  //     // get all permission
  //     const checkAllPermission = await model.getAllHotelPermission({
  //       ids: permissionIds,
  //       hotel_code,
  //     });

  //     if (checkAllPermission.length != uniquePermissionIds.length) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_BAD_REQUEST,
  //         message: "Permission ids are invalid",
  //       };
  //     }

  //     const rolePermissionPayload: {
  //       hotel_code: number;
  //       role_id: number;
  //       h_permission_id: number;
  //       permission_type: "read" | "write" | "update" | "delete";
  //       created_by: number;
  //     }[] = [];

  //     for (let i = 0; i < permissions.length; i++) {
  //       rolePermissionPayload.push({
  //         hotel_code,
  //         h_permission_id: permissions[i].h_permission_id,
  //         role_id: res[0],
  //         permission_type: permissions[i].permission_type,
  //         created_by: id,
  //       });
  //     }

  //     // insert role permission
  //     await model.createRolePermission(rolePermissionPayload);

  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_SUCCESSFUL,
  //       message: this.ResMsg.HTTP_SUCCESSFUL,
  //     };
  //   });
  // }

  // // get role
  // public async getRole(req: Request) {
  //   const data = await this.Model.rAdministrationModel().getAllRole(
  //     req.hotel_admin.hotel_code
  //   );

  //   return {
  //     success: true,
  //     code: this.StatusCode.HTTP_OK,
  //     data,
  //   };
  // }
  // // get single role
  // public async getSingleRole(req: Request) {
  //   const { id } = req.params;
  //   const model = this.Model.rAdministrationModel();

  //   const data = await model.getSingleRole({
  //     id: parseInt(id),
  //     hotel_code: req.hotel_admin.hotel_code,
  //   });

  //   const { permissions, ...rest } = data[0];
  //   const output_data: any = [];

  //   for (let i = 0; i < permissions?.length; i++) {
  //     let found = false;

  //     for (let j = 0; j < output_data.length; j++) {
  //       if (
  //         permissions[i].permission_group_id ==
  //         output_data[j].permission_group_id
  //       ) {
  //         let found_sub = false;
  //         for (let k = 0; k < output_data[j].subModules.length; k++) {
  //           if (
  //             output_data[j].subModules[k].permission_id ==
  //             permissions[i].permission_id
  //           ) {
  //             output_data[j].subModules[k].permission_type.push(
  //               permissions[i].permission_type
  //             );
  //             found_sub = true;
  //           }
  //         }
  //         if (!found_sub) {
  //           output_data[j].subModules.push({
  //             permission_id: permissions[i].permission_id,
  //             h_permission_id: permissions[i].h_permission_id,
  //             permission_name: permissions[i].permission_name,
  //             permission_type: [permissions[i].permission_type],
  //           });
  //         }

  //         found = true;
  //       }
  //     }

  //     if (!found) {
  //       output_data.push({
  //         permission_group_id: permissions[i].permission_group_id,
  //         permission_group_name: permissions[i].permission_group_name,
  //         subModules: [
  //           {
  //             permission_id: permissions[i].permission_id,
  //             h_permission_id: permissions[i].h_permission_id,
  //             permission_name: permissions[i].permission_name,
  //             permission_type: [permissions[i].permission_type],
  //           },
  //         ],
  //       });
  //     }
  //   }

  //   return {
  //     success: true,
  //     code: this.StatusCode.HTTP_OK,
  //     data: { ...rest, permission: output_data },
  //   };
  // }

  // public async updateSingleRole(req: Request) {
  //   const { id: role_id } = req.params;
  //   const { id: admin_id, hotel_code } = req.hotel_admin;
  //   const {
  //     role_name,
  //     added,
  //     deleted,
  //   }: { role_name: string; added: any[]; deleted: number[] } = req.body;
  //   const newPermission: any[] = [...new Set(added)];
  //   const deletedPermission: number[] = [...new Set(deleted)];

  //   return await this.db.transaction(async (trx) => {
  //     const model = this.Model.rAdministrationModel(trx);

  //     if (role_name) {
  //       // check role
  //       const checkRole = await model.getSingleRole({
  //         id: parseInt(role_id),
  //         hotel_code,
  //       });

  //       if (!checkRole.length) {
  //         return {
  //           success: false,
  //           code: this.StatusCode.HTTP_NOT_FOUND,
  //           message: "role not found",
  //         };
  //       }
  //       await model.updateSingleRole(
  //         parseInt(role_id),
  //         {
  //           name: role_name,
  //         },
  //         hotel_code
  //       );
  //     }

  //     // ================== new permission added step ================= //

  //     if (newPermission.length) {
  //       const addedPermissionIds = newPermission.map(
  //         (item: any) => item.h_permission_id
  //       );

  //       const uniquePermissionIds = [...new Set(addedPermissionIds)];

  //       // get all permission
  //       const checkAllPermission = await model.getAllHotelPermission({
  //         ids: addedPermissionIds,
  //         hotel_code,
  //       });

  //       if (checkAllPermission.length != uniquePermissionIds.length) {
  //         return {
  //           success: false,
  //           code: this.StatusCode.HTTP_BAD_REQUEST,
  //           message: "Permission ids are invalid",
  //         };
  //       }

  //       const rolePermissionPayload: {
  //         hotel_code: number;
  //         role_id: number;
  //         h_permission_id: number;
  //         permission_type: "read" | "write" | "update" | "delete";
  //       }[] = [];

  //       for (let i = 0; i < newPermission.length; i++) {
  //         rolePermissionPayload.push({
  //           hotel_code,
  //           h_permission_id: newPermission[i].h_permission_id,
  //           role_id: parseInt(role_id),
  //           permission_type: newPermission[i].permission_type,
  //         });
  //       }

  //       // insert role permission
  //       await model.createRolePermission(rolePermissionPayload);
  //     }

  //     // ===================  delete permission step ============= //

  //     if (deletedPermission.length) {
  //       await Promise.all(
  //         deletedPermission.map(async (item: any) => {
  //           await model.deleteRolePermission(
  //             item.h_permission_id,
  //             item.permission_type,
  //             parseInt(role_id)
  //           );
  //         })
  //       );
  //     }

  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_SUCCESSFUL,
  //       message: "Role updated successfully",
  //     };
  //   });
  // }

  // create role
  public async createRole(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, hotel_code } = req.hotel_admin;

      const model = this.Model.rAdministrationModel(trx);
      const { role_name, permissions } = req.body;
      const check_name = await model.getSingleRole({
        name: role_name,
        hotel_code,
      });

      console.log({ check_name });
      if (check_name.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: `Role already exists with this name`,
        };
      }
      const role_res = await model.createRole({
        name: role_name,
        created_by: id,
        hotel_code,
        init_role: false,
      });

      const uniquePermission: any = [];

      for (let i = 0; i < permissions.length; i++) {
        let found = false;
        for (let j = 0; j < uniquePermission.length; j++) {
          if (
            permissions[i].permission_id == uniquePermission[j].permission_id
          ) {
            found = true;
            break;
          }
        }

        if (!found) {
          uniquePermission.push(permissions[i]);
        }
      }

      if (uniquePermission.length) {
        const permission_body = uniquePermission.map((element: any) => {
          return {
            role_id: role_res[0].id,
            permission_id: element.permission_id,
            read: element.read,
            write: element.write,
            update: element.update,
            delete: element.delete,
            created_by: id,
            hotel_code,
          };
        });

        await model.createRolePermission(permission_body);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  //role list
  public async roleList(req: Request) {
    const { limit, skip, search } = req.query;

    const role_list = await this.Model.rAdministrationModel().roleList({
      limit: Number(limit),
      skip: Number(skip),
      hotel_code: req.hotel_admin.hotel_code,
      search: search as string,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: role_list.total,
      data: role_list.data,
    };
  }

  //permission list
  public async permissionList(req: Request) {
    const { limit, skip } = req.query;

    const permission_list =
      await this.Model.rAdministrationModel().permissionsList({
        limit: Number(limit),
        skip: Number(skip),
      });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: permission_list.total,
      data: permission_list.data,
    };
  }

  //get single role permission
  public async getSingleRolePermission(req: Request) {
    const role_id = req.params.id;

    const role_permission =
      await this.Model.rAdministrationModel().getSingleRole({
        id: parseInt(role_id),
        hotel_code: req.hotel_admin.hotel_code,
      });

    if (!role_permission.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: role_permission[0],
    };
  }

  //update role permission
  public async updateRolePermissions(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: user_id, hotel_code } = req.hotel_admin;
      const model = this.Model.rAdministrationModel(trx);
      const { id: role_id } = req.params;

      const check_role = await model.getSingleRole({
        id: Number(role_id),
        hotel_code,
      });

      if (!check_role.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (check_role[0].init_role) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message:
            "You cannot update this role. Because of it's softwares initial role",
        };
      }

      const { add_permissions, role_name, status } = req.body;

      if (role_name || status) {
        await model.updateRole({ name: role_name, status }, Number(role_id));
      }

      if (add_permissions) {
        const { data: getAllPermission } = await model.permissionsList({});

        const add_permissionsValidataion = [];

        for (let i = 0; i < add_permissions.length; i++) {
          for (let j = 0; j < getAllPermission?.length; j++) {
            if (
              add_permissions[i].permission_id ==
              getAllPermission[j].permission_id
            ) {
              add_permissionsValidataion.push(add_permissions[i]);
            }
          }
        }

        // get single role permission
        const { permissions } = check_role[0];

        const insertPermissionVal: any = [];
        const haveToUpdateVal: any = [];

        for (let i = 0; i < add_permissionsValidataion.length; i++) {
          let found = false;

          for (let j = 0; j < permissions.length; j++) {
            if (
              add_permissionsValidataion[i].permission_id ==
              permissions[j].permission_id
            ) {
              found = true;
              haveToUpdateVal.push(add_permissionsValidataion[i]);
              break;
            }
          }

          if (!found) {
            insertPermissionVal.push(add_permissions[i]);
          }
        }

        // insert permission
        const add_permission_body = insertPermissionVal.map((element: any) => {
          return {
            role_id,
            permission_id: element.permission_id,
            read: element.read,
            write: element.write,
            update: element.update,
            delete: element.delete,
            created_by: user_id,
          };
        });

        if (add_permission_body.length) {
          await model.createRolePermission(add_permission_body);
        }

        // update section
        if (haveToUpdateVal.length) {
          const update_permission_res = haveToUpdateVal.map(
            async (element: {
              read: 0 | 1;
              write: 0 | 1;
              update: 0 | 1;
              delete: 0 | 1;
              permission_id: number;
            }) => {
              await model.updateRolePermission(
                {
                  read: element.read,
                  update: element.update,
                  write: element.write,
                  delete: element.delete,
                  updated_by: user_id,
                },
                element.permission_id,
                parseInt(role_id)
              );
            }
          );
          await Promise.all(update_permission_res);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async createAdmin(req: Request) {
    const { id, hotel_code } = req.hotel_admin;
    const files = (req.files as Express.Multer.File[]) || [];
    if (files?.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }
    const { password, email, ...rest } = req.body;
    const model = this.Model.rAdministrationModel();

    //check admins email and phone number
    const check_admin = await model.getSingleAdmin({
      email,
    });

    console.log({ check_admin });

    if (check_admin.length) {
      if (check_admin[0].email === email) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Email already exists",
        };
      }
    }

    rest.email = email;
    rest.created_by = id;

    //password hashing
    const hashedPass = await Lib.hashPass(password);
    await model.createAdmin({
      password: hashedPass,
      hotel_code,
      ...rest,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //get all admin
  public async getAllAdmin(req: Request) {
    const { role_id, limit, skip, status, search } = req.query;

    const data = await this.Model.rAdministrationModel().getAllAdmin({
      limit: parseInt(limit as string),
      skip: parseInt(skip as string),
      role_id: parseInt(role_id as string),
      hotel_code: req.hotel_admin.hotel_code,
      search: search as string,
      status: status as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single admin
  public async getSingleAdmin(req: Request) {
    const data = await this.Model.rAdministrationModel().getSingleAdmin({
      id: Number(req.params.id),
    });

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { password, ...rest } = data[0];
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: rest,
    };
  }

  //update admin
  public async updateAdmin(req: Request) {
    const id = req.params.id;
    const model = this.Model.rAdministrationModel();
    const files = (req.files as Express.Multer.File[]) || [];
    if (files?.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }

    await model.updateAdmin(req.body, { id: Number(id) });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Successfully updated",
    };
  }
}

export default AdministrationService;
