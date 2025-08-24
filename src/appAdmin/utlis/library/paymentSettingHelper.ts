import AbstractServices from "../../../abstarcts/abstract.service";
import CustomError from "../../../utils/lib/customEror";

export default class PaymentSettingHelper extends AbstractServices {
  public validateRequiredFields(payload: any, requiredFields: string[]) {
    let details: Record<string, unknown> = {};
    if (typeof payload.details === "string") {
      details = JSON.parse(payload.details);
    } else {
      details = payload.details;
    }

    const missingFields = requiredFields.filter((field) => !details[field]);

    if (missingFields.length > 0) {
      throw new CustomError(
        `Missing required fields: ${missingFields.join(", ")}`,
        400
      );
    }
  }
}
