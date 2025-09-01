import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import ChannelManagerService from "../services/channelManager.service";
import ChannelManagerValidator from "../utlis/validator/channelManager.validator";

class ChannelManagerController extends AbstractController {
  private service = new ChannelManagerService();
  private validator = new ChannelManagerValidator();
  constructor() {
    super();
  }

  public addChannelManager = this.asyncWrapper.wrap(
    { bodySchema: this.validator.addChannelManager },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.addChannelManager(req);

      res.status(code).json(data);
    }
  );

  public getAllChannelManager = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllChannelManager(req);

      res.status(code).json(data);
    }
  );

  public updateChannelManager = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateChannelManager },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateChannelManager(req);

      res.status(code).json(data);
    }
  );
}
export default ChannelManagerController;
