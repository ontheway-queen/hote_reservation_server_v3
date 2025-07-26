import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

export class CommonService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAllCity(req: Request) {
    const data = await this.Model.mConfigurationModel().getAllCity({
      limit: parseInt(req.query.limit as string),
      skip: parseInt(req.query.limit as string),
      search: req.query.search as string,
      country_code: req.query.country_code as string,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
}
