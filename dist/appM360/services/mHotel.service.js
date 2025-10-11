"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const config_1 = __importDefault(require("../../config/config"));
const mHotelUserCredentials_template_1 = require("../../templates/mHotelUserCredentials.template");
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const constants_1 = require("../../utils/miscellaneous/constants");
class MHotelService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { hotel_email, user_name, password, accommodation_type_id, hotel_name, address, chain_name, city_code, country_code, description, expiry_date, latitude, longitude, postal_code, star_category, fax, phone, website_url, white_label, permission, } = req.body;
                const expiry = new Date(expiry_date);
                if (expiry < new Date()) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: "Expiry date must be later than the current date",
                    };
                }
                const files = req.files || [];
                const model = this.Model.HotelModel(trx);
                const administrationModel = this.Model.rAdministrationModel(trx);
                //  check hotel admin by hotel email
                const checkHotelAdmin = yield administrationModel.getSingleAdmin({
                    email: hotel_email,
                });
                if (checkHotelAdmin) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Admin email already exists",
                    };
                }
                const hashPass = yield lib_1.default.hashPass(password);
                // get last hotel id
                const lastHotelId = yield model.getHotelLastId();
                const now = new Date();
                const hotel_code = parseInt(`${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(lastHotelId).padStart(4, "0")}`, 10);
                let logoFilename = "";
                const hotelImages = [];
                files.forEach((file) => {
                    if (file.fieldname === "logo") {
                        logoFilename = file.filename;
                    }
                    else if (file.fieldname === "hotel_images") {
                        hotelImages.push({
                            hotel_code,
                            image_url: file.filename,
                            image_caption: undefined,
                            main_image: "N",
                        });
                    }
                    else if (file.fieldname === "main_image") {
                        hotelImages.push({
                            hotel_code,
                            image_url: file.filename,
                            image_caption: undefined,
                            main_image: "Y",
                        });
                    }
                });
                // get single accommodation type
                const getSingleAccomodationType = yield this.Model.mConfigurationModel().getSingleAccomodation(accommodation_type_id);
                // create hotel
                yield model.createHotel({
                    name: hotel_name,
                    hotel_code,
                    accommodation_type_id,
                    accommodation_type_name: (_a = getSingleAccomodationType[0]) === null || _a === void 0 ? void 0 : _a.name,
                    city_code,
                    country_code,
                    latitude,
                    longitude,
                    star_category,
                    address,
                    chain_name,
                    description,
                    postal_code,
                    expiry_date,
                    white_label_token: (0, uuid_1.v4)(),
                    white_label,
                });
                // insert others info
                yield model.insertHotelContactDetails({
                    logo: logoFilename,
                    email: hotel_email,
                    fax,
                    phone,
                    hotel_code,
                    website_url,
                });
                // Insert hotel accounts head
                yield lib_1.default.insertHotelCOA(trx, hotel_code);
                if (hotelImages.length)
                    yield model.insertHotelImages(hotelImages);
                // ============ create hotel admin step ==============//
                const configModel = this.Model.mConfigurationModel(trx);
                let extractPermission;
                let permissionRes = [];
                if (permission) {
                    extractPermission = JSON.parse(permission);
                    // check all permission
                    const checkAllPermission = yield configModel.getAllPermission({
                        ids: extractPermission,
                    });
                    if (checkAllPermission.length != extractPermission.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Invalid Permissions",
                        };
                    }
                    const hotel_permission_payload = extractPermission.map((item) => {
                        return {
                            permission_id: item,
                            hotel_code,
                        };
                    });
                    // insert hotel permission
                    permissionRes = yield configModel.addedHotelPermission(hotel_permission_payload);
                }
                // insert Role
                const roleRes = yield administrationModel.createRole({
                    name: "Super Admin",
                    hotel_code,
                    init_role: true,
                });
                if (permission) {
                    const rolePermissionPayload = [];
                    for (let i = 0; i < extractPermission.length; i++) {
                        for (let j = 0; j < 4; j++) {
                            rolePermissionPayload.push({
                                hotel_code,
                                h_permission_id: permissionRes[0].id + i,
                                read: 1,
                                write: 1,
                                update: 1,
                                delete: 1,
                                role_id: roleRes[0].id,
                            });
                        }
                    }
                    // insert role permission
                    yield administrationModel.insertInRolePermission(rolePermissionPayload);
                }
                // insert user admin
                yield administrationModel.createAdmin({
                    email: hotel_email,
                    name: user_name,
                    password: hashPass,
                    role_id: roleRes[0].id,
                    hotel_code,
                    owner: true,
                });
                yield lib_1.default.sendEmail(hotel_email, constants_1.OTP_FOR_CREDENTIALS, (0, mHotelUserCredentials_template_1.newHotelUserAccount)(hotel_email, password, hotel_name));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    getAllHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status, from_date, to_date, key, limit, skip } = req.query;
            const model = this.Model.HotelModel();
            const endDate = new Date(to_date);
            endDate.setDate(endDate.getDate() + 1);
            const { data, total } = yield model.getAllHotel({
                name: key,
                status: status,
                from_date: from_date,
                to_date: endDate,
                limit: limit,
                skip: skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSingleHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.HotelModel();
            const getSingleHotel = yield model.getSingleHotel({ id: parseInt(id) });
            if (!getSingleHotel) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            // const data: IhotelPermissions[] =
            //   await this.Model.mConfigurationModel().getAllPermissionByHotel(
            //     parseInt(id)
            //   );
            // const { permissions } = data[0];
            // const groupedPermissions: any = {};
            // permissions?.forEach((entry) => {
            //   const permission_group_id = entry.permission_group_id;
            //   const permission = {
            //     permission_id: entry.permission_id,
            //     permission_name: entry.permission_name,
            //   };
            //   if (!groupedPermissions[permission_group_id]) {
            //     groupedPermissions[permission_group_id] = {
            //       permission_group_id: permission_group_id,
            //       permissionGroupName: entry.permission_group_name,
            //       permissions: [permission],
            //     };
            //   } else {
            //     groupedPermissions[permission_group_id].permissions.push(permission);
            //   }
            // });
            // const result = Object.values(groupedPermissions);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: getSingleHotel,
                // data: { ...rest, permissions: result },
            };
        });
    }
    updateHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const _a = req.body, { fax, phone, website_url, hotel_email, remove_hotel_images, expiry_date, optional_phone1, hotel_name, white_label } = _a, hotelData = __rest(_a, ["fax", "phone", "website_url", "hotel_email", "remove_hotel_images", "expiry_date", "optional_phone1", "hotel_name", "white_label"]);
                const { id } = req.params;
                const parsedId = parseInt(id);
                const files = req.files || [];
                if (expiry_date && new Date(expiry_date) < new Date()) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: "Expiry date cannot be earlier than today",
                    };
                }
                const model = this.Model.HotelModel(trx);
                const existingHotel = yield model.getSingleHotel({ id: parsedId });
                if (!existingHotel) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { hotel_code } = existingHotel;
                // Filter out only defined fields for update
                const filteredUpdateData = Object.fromEntries(Object.entries(Object.assign(Object.assign({}, hotelData), { expiry_date, name: hotel_name })).filter(([_, value]) => value !== undefined));
                if (Object.keys(filteredUpdateData).length > 0) {
                    yield model.updateHotel(filteredUpdateData, { id: parsedId });
                }
                // === Handle file uploads ===
                let logoFilename;
                const hotelImages = [];
                for (const file of files) {
                    const { fieldname, filename } = file;
                    if (fieldname === "logo") {
                        logoFilename = filename;
                    }
                    else {
                        hotelImages.push({
                            hotel_code,
                            image_url: filename,
                            image_caption: undefined,
                            main_image: fieldname === "main_image" ? "Y" : "N",
                        });
                    }
                }
                // === Update hotel contact details ===
                const contactUpdates = {
                    email: hotel_email,
                    fax,
                    phone,
                    website_url,
                };
                if (logoFilename) {
                    contactUpdates.logo = logoFilename;
                }
                const hasContactUpdates = Object.values(contactUpdates).some((val) => val !== undefined);
                if (hasContactUpdates) {
                    yield model.updateHotelContactDetails(contactUpdates, hotel_code);
                }
                // === Insert new hotel images ===
                if (hotelImages.length > 0) {
                    yield model.insertHotelImages(hotelImages);
                }
                // === Remove selected hotel images ===
                if (Array.isArray(remove_hotel_images) &&
                    remove_hotel_images.length > 0) {
                    yield model.deleteHotelImage(remove_hotel_images, hotel_code);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Hotel updated successfully",
                };
            }));
        });
    }
    directLogin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.HotelModel().getSingleHotel({
                id: parseInt(req.params.id),
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const model = this.Model.rAdministrationModel();
            const checkUser = yield model.getSingleAdmin({
                owner: "true",
                hotel_code: data.hotel_code,
            });
            console.log({ checkUser });
            if (!checkUser) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.WRONG_CREDENTIALS,
                };
            }
            const { password: hashPass, id, status, hotel_status, hotel_contact_details } = checkUser, rest = __rest(checkUser, ["password", "id", "status", "hotel_status", "hotel_contact_details"]);
            const token = lib_1.default.createToken(Object.assign(Object.assign({ status }, rest), { id, type: "admin" }), config_1.default.JWT_SECRET_HOTEL_ADMIN, "24h");
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.LOGIN_SUCCESSFUL,
                data: Object.assign(Object.assign({ id }, rest), { status,
                    hotel_contact_details }),
                token,
            };
        });
    }
    getAllAccHeads(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.accountModel().getAccHeadsForSelect(Number(req.params.h_code));
            const headMap = new Map();
            for (const item of data) {
                headMap.set(item.head_id, {
                    head_id: item.head_id,
                    head_parent_id: item.head_parent_id,
                    head_code: item.head_code,
                    head_group_code: item.head_group_code,
                    head_name: item.head_name,
                    parent_head_code: item.parent_head_code,
                    parent_head_name: item.parent_head_name,
                    children: [],
                });
            }
            // Step 3: Build the hierarchy
            const rootHeads = [];
            for (const head of headMap.values()) {
                if (head.head_parent_id === null) {
                    // This is a root-level head
                    rootHeads.push(head);
                }
                else {
                    // Find the parent head
                    const parentHead = headMap.get(head.head_parent_id);
                    if (parentHead) {
                        // Add this head as a child of the parent
                        parentHead.children.push(head);
                    }
                }
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: rootHeads,
            };
        });
    }
    allGroups(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.accountModel().allGroups();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    insertAccHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = Number(req.params.h_code);
                const { group_code, name, parent_id } = req.body;
                const model = this.Model.accountModel(trx);
                for (const head of name) {
                    let newHeadCode = "";
                    if (parent_id) {
                        const parentHead = yield model.getAccountHead({
                            hotel_code,
                            group_code,
                            id: parent_id,
                        });
                        if (!parentHead.length) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: "Parent head not found!",
                            };
                        }
                        const { code: parent_head_code } = parentHead[0];
                        const heads = yield model.getAccountHead({
                            hotel_code,
                            group_code,
                            parent_id,
                            order_by: "ah.code",
                            order_to: "desc",
                        });
                        if (heads.length) {
                            const { code: child_code } = heads[0];
                            const lastHeadCodeNum = child_code.split(".");
                            const newNum = Number(lastHeadCodeNum[lastHeadCodeNum.length - 1]) + 1;
                            newHeadCode = lastHeadCodeNum.pop();
                            newHeadCode = lastHeadCodeNum.join(".");
                            if (newNum < 10) {
                                newHeadCode += ".00" + newNum;
                            }
                            else if (newNum < 100) {
                                newHeadCode += ".0" + newNum;
                            }
                            else {
                                newHeadCode += "." + newNum;
                            }
                        }
                        else {
                            newHeadCode = parent_head_code + ".001";
                        }
                    }
                    else {
                        const checkHead = yield model.getAccountHead({
                            hotel_code,
                            group_code,
                            parent_id: null,
                            order_by: "ah.id",
                            order_to: "desc",
                        });
                        if (checkHead.length) {
                            newHeadCode = Number(checkHead[0].code) + 1 + "";
                        }
                        else {
                            newHeadCode = Number(group_code) + 1 + "";
                        }
                    }
                    yield model.insertAccHead({
                        code: newHeadCode,
                        group_code,
                        hotel_code,
                        name: head,
                        parent_id,
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Account head created successfully.",
                };
            }));
        });
    }
    updateAccHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const id = req.params.id;
            const data = yield this.Model.accountModel().updateAccHead(body, id);
            return { success: true, data };
        });
    }
    renewAccHead(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const hotel_code = Number(req.params.h_code);
                const accModel = this.Model.accountModel(trx);
                yield accModel.deleteAccHeadConfig({ hotel_code });
                yield accModel.deleteAccHeads({ hotel_code });
                // Insert hotel accounts head
                yield lib_1.default.insertHotelCOA(trx, hotel_code);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Setup new COA",
                };
            }));
        });
    }
}
exports.default = MHotelService;
//# sourceMappingURL=mHotel.service.js.map