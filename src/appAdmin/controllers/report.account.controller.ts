import { Request, Response } from 'express';
import AbstractController from '../../abstarcts/abstract.controller';
import AccountReportService from '../services/report.account.service';
import ReportValidator from '../utlis/validator/reports.validator';

class AccountReportController extends AbstractController {
  private accountReportService = new AccountReportService();
  private reportValidator = new ReportValidator();
  constructor() {
    super();
  }

  // get account Report
  public getAccountReport = this.asyncWrapper.wrap(
    { querySchema: this.reportValidator.getAllAccountQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.accountReportService.getAccountReport(req);

      res.status(code).json(data);
    }
  );

  //<sabbir.m360ict@gmail.com> ---- Sabbir Hosen;
  // Account Reports

  public getJournalReport = this.asyncWrapper.wrap(
    { querySchema: this.reportValidator.accountJournalReportQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.accountReportService.getJournalReport(req);

      res.status(code).json(data);
    }
  );

  public getAccLedger = this.asyncWrapper.wrap(
    { querySchema: this.reportValidator.accountLedgerReportQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.accountReportService.getAccLedger(
        req
      );

      res.status(code).json(data);
    }
  );

  public getTrialBalanceReport = this.asyncWrapper.wrap(
    { querySchema: this.reportValidator.accountJournalReportQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.accountReportService.getTrialBalanceReport(req);

      res.status(code).json(data);
    }
  );

  public getIncomeStatement = this.asyncWrapper.wrap(
    { querySchema: this.reportValidator.accountJournalReportQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.accountReportService.getIncomeStatement(req);

      res.status(code).json(data);
    }
  );

  public getBalanceSheet = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.accountReportService.getBalanceSheet(
        req
      );

      res.status(code).json(data);
    }
  );
}
export default AccountReportController;
