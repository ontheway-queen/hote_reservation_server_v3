import { Request } from "express";
import AbstractServices from "../../abstarcts/abstract.service";

class ChannelManagerService extends AbstractServices {
  constructor() {
    super();
  }

  public async addChannelManager(req: Request) {
    const hotel_code = req.hotel_admin.hotel_code;

    await this.Model.channelManagerModel().addChannelManager({
      ...req.body,
      hotel_code,
      created_by: req.hotel_admin.hotel_code,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: "Channel has been added",
    };
  }

  public async getAllChannelManager(req: Request) {
    const data = await this.Model.channelManagerModel().getAllChannelManager({
      hotel_code: req.hotel_admin.hotel_code,
      is_internal: Boolean(req.query.is_internal as string),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateChannelManager(req: Request) {
    const hotel_code = req.hotel_admin.hotel_code;

    await this.Model.channelManagerModel().updateChannelManager(
      {
        ...req.body,
      },
      { id: Number(req.params.id), hotel_code }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Channel has been updated",
    };
  }
}
export default ChannelManagerService;
