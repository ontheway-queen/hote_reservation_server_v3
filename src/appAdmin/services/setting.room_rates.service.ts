import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import { IRoomRateReqBodyPayload } from "../utlis/interfaces/setting.interface";

class RoomRatesService extends AbstractServices {
  constructor() {
    super();
  }

  // Get all room rate
  public async createRoomRate(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const {
        cancellation_policy_id,
        meal_plan_items,
        room_type_prices,
        sources,
        name,
      } = req.body as IRoomRateReqBodyPayload;

      console.log(meal_plan_items);

      const settingModel = this.Model.settingModel(trx);

      // Validate meal plan items
      const checkMealItems = await settingModel.getAllMealPlan({
        ids: meal_plan_items,
      });
      if (meal_plan_items.length !== checkMealItems.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid meal plan items",
        };
      }

      // Validate sources
      const checkSources = await settingModel.getAllSources({
        ids: sources,
      });
      if (checkSources.length !== sources.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid Sources",
        };
      }

      // Validate cancellation policy
      if (cancellation_policy_id) {
        const cancellationPolicyData =
          await settingModel.getSingleCancellationPolicy(
            hotel_code,
            cancellation_policy_id
          );
        if (!cancellationPolicyData.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Invalid cancellation policy",
          };
        }
      }

      // Validate room types
      const room_type_ids = room_type_prices.map((item) => item.room_type_id);
      const { data: check_room_types } = await settingModel.getAllRoomType({
        ids: room_type_ids,
        is_active: "true",
        hotel_code,
      });

      if (room_type_ids.length !== check_room_types.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid room types",
        };
      }

      // Insert rate plan
      const ratePlanRes = await settingModel.insertInRatePlans({
        hotel_code,
        cancellation_policy_id,
        name,
      });

      const ratePlanDetailsPayload: {
        hotel_code: number;
        rate_plan_id: number;
        room_type_id: number;
        base_rate: number;
      }[] = [];

      room_type_prices.forEach((item) => {
        ratePlanDetailsPayload.push({
          hotel_code,
          base_rate: item.base_rate,
          rate_plan_id: ratePlanRes[0].id,
          room_type_id: item.room_type_id,
        });
      });

      // Insert rate plan details (base pricing) for each room type.
      await settingModel.insertInRatePlanDetails(ratePlanDetailsPayload);

      // Prepare meal mappings
      const mealMappingPayload = meal_plan_items.map((item) => ({
        rate_plan_id: ratePlanRes[0].id,
        meal_plan_id: item,
        included: true,
      }));
      await settingModel.insertInRatePlanMealMapping(mealMappingPayload);

      // Prepare source mappings
      const sourcePayload = sources.map((item) => ({
        rate_plan_id: ratePlanRes[0].id,
        source_id: item,
      }));
      await settingModel.insertInRatePlanSourceMapping(sourcePayload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room rates created successfully.",
      };
    });
  }

  public async getAllRoomRate(req: Request) {
    const { hotel_code } = req.hotel_admin;
    const { limit, skip, search, status } = req.query;

    const { data, total } = await this.Model.settingModel().getAllRoomRate({
      hotel_code,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  public async getSingleRoomRate(req: Request) {
    const { hotel_code } = req.hotel_admin;

    const raw = await this.Model.settingModel().getSingleRoomRate(
      hotel_code,
      parseInt(req.params.id)
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        ...raw,
      },
    };
  }

  public async updateRoomRate(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { hotel_code } = req.hotel_admin;
      const rate_plan_id = Number(req.params.id);
      const {
        cancellation_policy_id,
        meal_plan_items,
        room_type_prices,
        sources,
        name,
      } = req.body as IRoomRateReqBodyPayload;

      const settingModel = this.Model.settingModel(trx);

      // Validate meal plan items
      const checkMealItems = await settingModel.getAllMealPlan({
        ids: meal_plan_items,
      });
      if (meal_plan_items.length !== checkMealItems.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid meal plan items",
        };
      }

      // Validate sources
      const checkSources = await settingModel.getAllSources({
        ids: sources,
      });
      if (checkSources.length !== sources.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid sources",
        };
      }

      // Validate cancellation policy
      const cancellationPolicyData =
        await settingModel.getSingleCancellationPolicy(
          hotel_code,
          cancellation_policy_id
        );
      if (!cancellationPolicyData.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Invalid cancellation policy",
        };
      }

      // Validate room types
      const room_type_ids = room_type_prices.map((item) => item.room_type_id);
      const { data: check_room_types } = await settingModel.getAllRoomType({
        ids: room_type_ids,
        is_active: "true",
        hotel_code,
      });
      if (room_type_ids.length !== check_room_types.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Invalid room types",
        };
      }

      // update rate plan
      await settingModel.updateInRatePlans(
        { name, cancellation_policy_id },
        rate_plan_id,
        hotel_code
      );

      // delete meal mapping
      await settingModel.deleteInRatePlanMealMapping(rate_plan_id);

      //  insert new meal mapping
      const mealMappingPayload = meal_plan_items.map((item) => ({
        rate_plan_id,
        meal_plan_id: item,
        included: true,
      }));

      if (mealMappingPayload.length) {
        await settingModel.insertInRatePlanMealMapping(mealMappingPayload);
      }

      //delete  source mapping
      await settingModel.deleteInRatePlanSourceMapping(rate_plan_id);

      const sourcePayload = sources.map((item) => ({
        rate_plan_id,
        source_id: item,
      }));
      if (sourcePayload.length) {
        await settingModel.insertInRatePlanSourceMapping(sourcePayload);
      }

      const ratePlanDetailsPayload = [] as {
        hotel_code: number;
        rate_plan_id: number;
        room_type_id: number;
        base_rate: number;
      }[];

      room_type_prices.forEach((item) => {
        // Insert base/default pricing for each room type in this rate plan:
        ratePlanDetailsPayload.push({
          hotel_code,
          base_rate: item.base_rate,
          rate_plan_id,
          room_type_id: item.room_type_id,
        });
      });

      // delete rate plan details
      await settingModel.deleteInRatePlanDetails(rate_plan_id);

      // Insert new rate plan details
      if (ratePlanDetailsPayload.length) {
        await settingModel.insertInRatePlanDetails(ratePlanDetailsPayload);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Room rate updated successfully.",
      };
    });
  }
}
export default RoomRatesService;
