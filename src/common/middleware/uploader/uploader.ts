import CommonAbstractStorage from "../../commonAbstract/common.abstract.storage";
import { NextFunction, Request, Response } from "express";
import CustomError from "../../../utils/lib/customEror";
import multerS3 from "multer-s3";
import multer from "multer";
import path from "path";
import { allowAllFileTypes, rootFileFolder } from "./uploaderConstants";

import StatusCode from "../../../utils/miscellaneous/statusCode";
import config from "../../../config/config";

class Uploader extends CommonAbstractStorage {
  constructor() {
    super();
  }

  // cloud upload raw
  public cloudUploadRaw(folder: string, types: string[] = allowAllFileTypes) {
    return (req: Request, res: Response, next: NextFunction): void => {
      req.upFiles = [];
      const upload = multer({
        storage: multerS3({
          acl: "public-read",
          s3: this.s3Client,
          bucket: config.AWS_S3_BUCKET,
          metadata: function (_req, file, cb) {
            cb(null, { fieldName: file.fieldname });
          },
          key: function (req, file, cb) {
            const fileWithFolder =
              folder +
              "/" +
              Date.now() +
              "-" +
              Math.round(Math.random() * 1e9) +
              path.extname(file.originalname);

            file.filename = fileWithFolder;
            req.upFiles.push(fileWithFolder);
            cb(null, `${rootFileFolder}/${fileWithFolder}`);
          },
        }),
        fileFilter: function (_req, file, cb) {
          // Check allowed extensions
          if (types.includes(file.mimetype)) {
            cb(null, true); // no errors
          } else {
            cb(
              new Error(
                "File mimetype is not allowed" + " for " + file.fieldname
              )
            );
          }
        },
      });

      upload.any()(req, res, (err) => {
        console.log(req.files);
        if (err) {
          next(new CustomError(err.message, 500));
        } else {
          next();
        }
      });
    };
  }

  // cloud upload compress
  public cloudUploadCompress(
    folder: string,
    types: string[] = allowAllFileTypes
  ) {}

  // local upload raw
  public localUploadRaw(folder: string, types: string[] = allowAllFileTypes) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      req.upFiles = [];
      const uploadsFolder = `${__dirname}/../../../${rootFileFolder}/${folder}`;

      const storage = multer.diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, uploadsFolder);
        },
        filename: (req, file, cb) => {
          const nameWithFolder =
            folder +
            "/" +
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);
          req.upFiles.push(nameWithFolder);
          cb(null, nameWithFolder);
        },
      });

      const upload = multer({
        storage: storage,
        fileFilter: (_req, file, cb) => {
          console.log(file.mimetype);
          if (types.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new Error(
                "File mimetype is not allowed" + " for " + file.fieldname
              )
            );
          }
        },
      });

      upload.any()(req, _res, (err) => {
        if (err) {
          console.log({ err });
          next(new CustomError(err.message, StatusCode.HTTP_BAD_REQUEST));
        } else {
          next();
        }
      });
    };
  }

  // local upload compress
  public localUploadCompress(
    folder: string,
    types: string[] = allowAllFileTypes
  ) {}
}
export default Uploader;
