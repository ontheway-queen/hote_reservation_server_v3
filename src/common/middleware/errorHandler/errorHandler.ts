import { Request, Response, NextFunction } from "express";
import CustomError from "../../../utils/lib/customEror";
import ManageFile from "../../../utils/lib/manageFile";
interface ICustomError {
  success: boolean;
  message: string;
  level?: string;
}
class ErrorHandler {
  private customError: ICustomError;
  private manageFile: ManageFile;

  constructor() {
    this.customError = {
      success: false,
      message: "Internal server error!",
      level: "ERROR",
    };

    this.manageFile = new ManageFile();
  }

  /**
   * handleErrors
   */
  public handleErrors = async (
    err: CustomError,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    // file removing starts
    const files = req.upFiles || [];

    if (files.length) {
      await this.manageFile.deleteFromCloud(files);
    }

    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  };
}

export default ErrorHandler;
