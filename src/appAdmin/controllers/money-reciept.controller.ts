import { Request, Response } from "express";
import AbstractController from "../../abstarcts/abstract.controller";
import MoneyRecieptService from "../services/money-reciept.service";
import MoneyRecieptValidator from "../utlis/validator/money-reciept.validator";

class MoneyRecieptController extends AbstractController {
  private moneyRecieptService = new MoneyRecieptService();
  private moneyRecieptValidator = new MoneyRecieptValidator();
  constructor() {
    super();
  }
}

export default MoneyRecieptController;
