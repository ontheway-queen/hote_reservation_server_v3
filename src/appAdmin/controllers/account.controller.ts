import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import validator from "../utlis/validator/account.validator";
import AccountService from "../services/account.service";

class AccountController extends AbstractController {
  private service = new AccountService();
  private validator = new validator();
  constructor() {
    super();
  }

  // public createAccountHead = this.asyncWrapper.wrap(
  //   { bodySchema: this.validator.createAccountHeadValidator },
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.createAccountHead(
  //       req
  //     );

  //     res.status(code).json(data);
  //   }
  // );

  // public getAllAccountHead = this.asyncWrapper.wrap(
  //   { bodySchema: this.validator.createAccountValidator },
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } = await this.service.getAllAccountHead(
  //       req
  //     );

  //     res.status(code).json(data);
  //   }
  // );

  public getAllGroups = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const data = await this.service.allGroups(req);
      res.status(200).json(data);
    }
  );

  public getallAccHeads = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAccHeads(req);

      res.status(code).json(data);
    }
  );

  public deleteAccHead = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const data = await this.service.deleteAccHead(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error("get all products...");
      }
    }
  );

  public insertAccHead = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.insertAccHead(req);

      res.status(code).json(data);
    }
  );

  public updateAccHead = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const data = await this.service.updateAccHead(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error("get all products...");
      }
    }
  );

  public allAccVouchers = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const data = await this.service.allAccVouchers(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error("get all products...");
      }
    }
  );

  public generalJournal = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const data = await this.service.generalJournal(req);

      if (data.success) {
        res.status(200).json(data);
      } else {
        this.error("get all products...");
      }
    }
  );

  public createAccount = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createAccountValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAccount(req);

      res.status(code).json(data);
    }
  );

  public getAllAccount = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllAccountQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAccount(req);
      res.status(code).json(data);
    }
  );

  // Update Account
  public updateAccount = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateAccountValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAccount(req);

      res.status(code).json(data);
    }
  );

  // balance transfer
  public balanceTransfer = this.asyncWrapper.wrap(
    { bodySchema: this.validator.balanceTransferValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.balanceTransfer(req);

      res.status(code).json(data);
    }
  );
}
export default AccountController;
