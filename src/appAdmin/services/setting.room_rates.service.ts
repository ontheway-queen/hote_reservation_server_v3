import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

import { IRoomRateReqBodyPayload } from "../utlis/interfaces/setting.interface";
import { HelperFunction } from "../utlis/library/helperFunction";

class RoomRatesService extends AbstractServices {
  constructor() {
    super();
  }

  // public async createRoomRate(req: Request) {
  //   return await this.db.transaction(async (trx) => {
  //     const { hotel_code } = req.hotel_admin;
  //     const {
  //       cancellation_policy_id,
  //       meal_plan_items,
  //       room_type_prices,
  //       sources,
  //       name,
  //     } = req.body as IRoomRateReqBodyPayload;

  //     const settingModel = this.Model.settingModel(trx);

  //     // check meal items
  //     const checkMealItems = await settingModel.getAllMealItems({
  //       ids: meal_plan_items,
  //       hotel_code,
  //     });

  //     if (meal_plan_items.length !== checkMealItems.length) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_BAD_REQUEST,
  //         message: "Invalid meal plan items",
  //       };
  //     }
  //     // check sources
  //     const checkSources = await settingModel.getAllSources({
  //       ids: sources,
  //     });

  //     if (checkSources.length !== sources.length) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_BAD_REQUEST,
  //         message: "Invalid Sources",
  //       };
  //     }

  //     // check cancellation policy
  //     const cancellationPolicyData =
  //       await settingModel.getSingleCancellationPolicy(
  //         hotel_code,
  //         cancellation_policy_id
  //       );

  //     if (!cancellationPolicyData.length) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_CONFLICT,
  //         message: "Invalid cancellation policy",
  //       };
  //     }

  //     // check room types

  //     const room_type_ids = room_type_prices.map((item) => item.room_type_id);

  //     const { data: check_room_types } = await settingModel.getAllRoomType({
  //       ids: room_type_ids,
  //       is_active: "true",
  //       hotel_code,
  //     });

  //     if (room_type_ids.length !== check_room_types.length) {
  //       return {
  //         success: false,
  //         code: this.StatusCode.HTTP_BAD_REQUEST,
  //         message: "Invalid room types",
  //       };
  //     }

  //     const start_date = new Date().toISOString();
  //     const todayPlus365 = new Date();
  //     todayPlus365.setUTCDate(todayPlus365.getUTCDate() + 365);
  //     const end_date = todayPlus365.toISOString().split("T")[0];

  //     // insert rate plan
  //     const ratePlanRes = await settingModel.insertInRatePlans({
  //       hotel_code,
  //       cancellation_policy_id,
  //       name,
  //     });

  //     const ratePlanDetailsPayload = [] as {
  //       hotel_code: number;
  //       rate_plan_id: number;
  //       room_type_id: number;
  //       base_rate: number;
  //       extra_adult_rate?: number;
  //       extra_child_rate?: number;
  //       start_date: string;
  //       end_date: string;
  //     }[];

  //     const dailyRatePayload = [] as {
  //       hotel_code: number;
  //       rate_plan_id: number;
  //       room_type_id: number;
  //       date: string;
  //       rate: number;
  //       extra_adult_rate?: number;
  //       extra_child_rate?: number;
  //     }[];

  //     room_type_prices.forEach((item) => {
  //       ratePlanDetailsPayload.push({
  //         hotel_code,
  //         start_date,
  //         end_date,
  //         extra_adult_rate: item.extra_adult_rate,
  //         extra_child_rate: item.extra_child_rate,
  //         base_rate: item.base_rate,
  //         rate_plan_id: ratePlanRes[0].id,
  //         room_type_id: item.room_type_id,
  //       });

  //       // daily rates
  //       item.specific_dates?.forEach((sp_item) => {
  //         dailyRatePayload.push({
  //           hotel_code,
  //           date: sp_item.date,
  //           rate: sp_item.rate,
  //           rate_plan_id: ratePlanRes[0].id,
  //           room_type_id: item.room_type_id,
  //           extra_adult_rate: sp_item.extra_adult_rate,
  //           extra_child_rate: sp_item.extra_child_rate,
  //         });
  //       });
  //     });
  //     // inert rate plan details
  //     await settingModel.insertInRatePlanDetails(ratePlanDetailsPayload);

  //     const mealMappingPayload = meal_plan_items.map((item) => {
  //       return {
  //         rate_plan_id: ratePlanRes[0].id,
  //         meal_plan_item_id: item,
  //         included: true,
  //       };
  //     });

  //     // insert meal mappings
  //     await settingModel.insertInRatePlanMealMapping(mealMappingPayload);

  //     // insert source mapping
  //     const sourcePayload = sources.map((item) => {
  //       return {
  //         rate_plan_id: ratePlanRes[0].id,
  //         source_id: item,
  //       };
  //     });

  //     await settingModel.insertInRatePlanSourceMapping(sourcePayload);

  //     // insert in daily rates
  //     if (dailyRatePayload.length) {
  //       await settingModel.insertInDailyRates(dailyRatePayload);
  //     }

  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_SUCCESSFUL,
  //       message: "Room rates created successfully.",
  //     };
  //   });
  // }

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
      const checkMealItems = await settingModel.getAllMealItems({
        ids: meal_plan_items,
        hotel_code,
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

      // For base pricing default period: from now till 365 days from now.
      const start_date = new Date().toISOString().split("T")[0];
      const todayPlus365 = new Date();
      todayPlus365.setUTCDate(todayPlus365.getUTCDate() + 365);
      const end_date = todayPlus365.toISOString().split("T")[0];

      // Insert rate plan
      const ratePlanRes = await settingModel.insertInRatePlans({
        hotel_code,
        cancellation_policy_id,
        name,
      });

      // Prepare payloads for rate plan details, daily rates, and child rate groups.
      const ratePlanDetailsPayload: {
        hotel_code: number;
        rate_plan_id: number;
        room_type_id: number;
        base_rate: number;
        extra_adult_rate?: number;
        extra_child_rate?: number;
        start_date: string;
        end_date: string;
      }[] = [];

      const dailyRatePayload: {
        hotel_code: number;
        rate_plan_id: number;
        room_type_id: number;
        date: string;
        rate: number;
        extra_adult_rate?: number;
        extra_child_rate?: number;
      }[] = [];

      // New payload for child rate groups
      const childRateGroupsPayload: {
        hotel_code: number;
        rate_plan_id: number;
        room_type_id: number;
        age_from: number;
        age_to: number;
        rate_type: "free" | "fixed" | "percentage" | "same_as_adult";
        rate_value: number;
      }[] = [];

      room_type_prices.forEach((item) => {
        // Insert base/default pricing for each room type in this rate plan:
        ratePlanDetailsPayload.push({
          hotel_code,
          start_date,
          end_date,
          extra_adult_rate: item.extra_adult_rate,
          extra_child_rate: item.extra_child_rate,
          base_rate: item.base_rate,
          rate_plan_id: ratePlanRes[0].id,
          room_type_id: item.room_type_id,
        });

        // Process child rate groups if present:
        if (item.child_rate_groups && item.child_rate_groups.length > 0) {
          item.child_rate_groups.forEach((childGroup) => {
            childRateGroupsPayload.push({
              hotel_code: hotel_code,
              rate_plan_id: ratePlanRes[0].id,
              room_type_id: item.room_type_id,
              age_from: childGroup.age_from,
              age_to: childGroup.age_to,
              rate_type: childGroup.rate_type,
              rate_value: childGroup.rate_value,
            });
          });
        }

        // Process daily rate overrides if provided:
        item.specific_dates?.forEach((sp_item) => {
          if (sp_item.type === "for_all_specific_day") {
            sp_item.date.forEach((date) => {
              dailyRatePayload.push({
                hotel_code,
                date,
                rate: sp_item.rate,
                rate_plan_id: ratePlanRes[0].id,
                room_type_id: item.room_type_id,
                extra_adult_rate: sp_item.extra_adult_rate,
                extra_child_rate: sp_item.extra_child_rate,
              });
            });
          } else {
            dailyRatePayload.push({
              hotel_code,
              date: sp_item.date[0],
              rate: sp_item.rate,
              rate_plan_id: ratePlanRes[0].id,
              room_type_id: item.room_type_id,
              extra_adult_rate: sp_item.extra_adult_rate,
              extra_child_rate: sp_item.extra_child_rate,
            });
          }
        });
      });

      // Insert rate plan details (base pricing) for each room type.
      await settingModel.insertInRatePlanDetails(ratePlanDetailsPayload);

      // Insert child rate groups if any
      if (childRateGroupsPayload.length) {
        await settingModel.insertInChildRateGroups(childRateGroupsPayload);
      }

      // Prepare meal mappings
      const mealMappingPayload = meal_plan_items.map((item) => ({
        rate_plan_id: ratePlanRes[0].id,
        meal_plan_item_id: item,
        included: true,
      }));
      await settingModel.insertInRatePlanMealMapping(mealMappingPayload);

      // Prepare source mappings
      const sourcePayload = sources.map((item) => ({
        rate_plan_id: ratePlanRes[0].id,
        source_id: item,
      }));
      await settingModel.insertInRatePlanSourceMapping(sourcePayload);

      // Insert daily rate overrides if any.
      if (dailyRatePayload.length) {
        await settingModel.insertInDailyRates(dailyRatePayload);
      }

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

    const calendarView = HelperFunction.generateRateCalendar(raw);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        ...raw,
        calendar: calendarView,
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
      const checkMealItems = await settingModel.getAllMealItems({
        ids: meal_plan_items,
        hotel_code,
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
        meal_plan_item_id: item,
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

      // Prepare new payloads
      const start_date = new Date().toISOString().split("T")[0];
      const todayPlus365 = new Date();
      todayPlus365.setUTCDate(todayPlus365.getUTCDate() + 365);
      const end_date = todayPlus365.toISOString().split("T")[0];

      const ratePlanDetailsPayload = [] as {
        hotel_code: number;
        rate_plan_id: number;
        room_type_id: number;
        base_rate: number;
        extra_adult_rate?: number;
        extra_child_rate?: number;
        start_date: string;
        end_date: string;
      }[];

      const dailyRatePayload = [] as {
        hotel_code: number;
        rate_plan_id: number;
        room_type_id: number;
        date: string;
        rate: number;
        extra_adult_rate?: number;
        extra_child_rate?: number;
      }[];

      // New payload for child rate groups
      const childRateGroupsPayload: {
        hotel_code: number;
        rate_plan_id: number;
        room_type_id: number;
        age_from: number;
        age_to: number;
        rate_type: "free" | "fixed" | "percentage" | "same_as_adult";
        rate_value: number;
      }[] = [];

      room_type_prices.forEach((item) => {
        // Insert base/default pricing for each room type in this rate plan:
        ratePlanDetailsPayload.push({
          hotel_code,
          start_date,
          end_date,
          extra_adult_rate: item.extra_adult_rate,
          extra_child_rate: item.extra_child_rate,
          base_rate: item.base_rate,
          rate_plan_id,
          room_type_id: item.room_type_id,
        });

        // Process child rate groups if present:
        if (item.child_rate_groups && item.child_rate_groups.length > 0) {
          item.child_rate_groups.forEach((childGroup) => {
            childRateGroupsPayload.push({
              hotel_code: hotel_code,
              rate_plan_id,
              room_type_id: item.room_type_id,
              age_from: childGroup.age_from,
              age_to: childGroup.age_to,
              rate_type: childGroup.rate_type,
              rate_value: childGroup.rate_value,
            });
          });
        }

        // Process daily rate overrides if provided:
        item.specific_dates?.forEach((sp_item) => {
          if (sp_item.type === "for_all_specific_day") {
            sp_item.date.forEach((date) => {
              dailyRatePayload.push({
                hotel_code,
                date,
                rate: sp_item.rate,
                rate_plan_id,
                room_type_id: item.room_type_id,
                extra_adult_rate: sp_item.extra_adult_rate,
                extra_child_rate: sp_item.extra_child_rate,
              });
            });
          } else {
            dailyRatePayload.push({
              hotel_code,
              date: sp_item.date[0],
              rate: sp_item.rate,
              rate_plan_id,
              room_type_id: item.room_type_id,
              extra_adult_rate: sp_item.extra_adult_rate,
              extra_child_rate: sp_item.extra_child_rate,
            });
          }
        });
      });

      // Insert child rate groups if any
      if (childRateGroupsPayload.length) {
        await settingModel.deleteInChildRateGroups(rate_plan_id);

        await settingModel.insertInChildRateGroups(childRateGroupsPayload);
      }

      // delete rate plan details
      await settingModel.deleteInRatePlanDetails(rate_plan_id);

      // Insert new rate plan details
      if (ratePlanDetailsPayload.length) {
        await settingModel.insertInRatePlanDetails(ratePlanDetailsPayload);
      }

      // delete daily rates
      await settingModel.deleteInRatePlanDailyRates(rate_plan_id);
      // Insert new daily rates
      if (dailyRatePayload.length) {
        await settingModel.insertInDailyRates(dailyRatePayload);
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
