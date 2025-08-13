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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../abstarcts/abstract.service"));
const customEror_1 = __importDefault(require("../../utils/lib/customEror"));
class UserService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // registration
    getProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.btoc_user;
            const model = this.Model.btocModel().UserModel();
            const userProfile = yield model.getProfile({ id: user_id });
            if (!userProfile) {
                throw new customEror_1.default("User not found!", this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "User registration successful",
                data: userProfile,
            };
        });
    }
    // update profile
    updateProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ test: req.btoc_user });
            const { email } = req.btoc_user;
            const payload = req.body;
            const files = req.upFiles;
            const model = this.Model.btocModel().UserModel();
            const isUserExists = yield model.checkUser({ email });
            if (!isUserExists) {
                throw new customEror_1.default("User not found!", this.StatusCode.HTTP_NOT_FOUND);
            }
            const modifiedPayload = Object.assign(Object.assign({}, payload), { photo: files && files.length > 0 ? files[0] : null });
            yield model.updateProfile({
                id: isUserExists.id,
                payload: modifiedPayload,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Profile update successful",
            };
        });
    }
}
exports.default = UserService;
//# sourceMappingURL=user.service.js.map