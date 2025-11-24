import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { errorCode } from "../../config/errorCode";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { checkUploadFile } from "../../utils/check";
import {
  createOneProduct,
  getProductById,
  updateOneProduct,
} from "../../services/productService";
import ImageQueue from "../../jobs/queues/imageQueue";
import CacheQueue from "../../jobs/queues/cacheQueue";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
  files?: any;
}

const removeFiles = async (
  originalFiles: string[],
  optimizedFiles: string[] | null
) => {
  try {
    // get old image file path
    for (const originalFile of originalFiles) {
      const originalFilePath = path.join(
        __dirname,
        "../../..",
        "/uploads/images",
        originalFile
      );
      await unlink(originalFilePath);
    }

    // get old optimized image file path
    if (optimizedFiles) {
      for (const optimizedFile of optimizedFiles) {
        const optimizedFilePath = path.join(
          __dirname,
          "../../..",
          "/uploads/optimizeImages",
          optimizedFile
        );
        await unlink(optimizedFilePath);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const createProduct = [
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      if (req.files && req.files.length > 0) {
        const originalFiles = req.files.map((file: any) => file.filename);
        await removeFiles(originalFiles, null);
      }
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const {
      name,
      description,
      price,
      discount,
      inventory,
      category,
      type,
      tags,
    } = req.body;

    const user = req.user;

    console.log("req.files", req.files);

    checkUploadFile(req.files && req.files.length > 0);

    await Promise.all(
      req.files.map(async (file: any) => {
        // no extension, just filename
        const splitFileName = file.filename.split(".")[0];

        // add job to Queue
        return ImageQueue.add(
          "optimize-image",
          {
            filePath: file?.path,
            fileName: `${splitFileName}.webp`,
            width: 835,
            height: 577,
            quality: 100,
          },
          {
            attempts: 3, // max attempts
            backoff: {
              type: "exponential",
              delay: 1000,
            },
          }
        );
      })
    );

    const originalFileNames = req.files.map((file: any) => ({
      path: file.filename,
    }));

    const data: any = {
      name,
      description,
      price,
      discount,
      inventory: +inventory,
      images: originalFileNames,
      category,
      type,
      tags,
    };

    const product = await createOneProduct(data);

    // invalidate cache after creating a new post
    await CacheQueue.add(
      "invalidate-product-cache",
      {
        pattern: "products:*", // invalidate ( delete ) all posts
      },
      {
        jobId: `invalidate-${Date.now()}`, // unique job id
        priority: 1, // high priority
      }
    );

    res.status(201).json({
      message: "Successfully created a new product.",
      postId: product.id,
    });
  },
];

export const updateProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req).array({ onlyFirstError: true });
  // If validation error occurs
  if (errors.length > 0) {
    if (req.files && req.files.length > 0) {
      const originalFiles = req.files.map((file: any) => file.filename);
      await removeFiles(originalFiles, null);
    }
    return next(createError(errors[0].msg, 400, errorCode.invalid));
  }

  const {
    productId,
    name,
    description,
    price,
    discount,
    inventory,
    category,
    type,
    tags,
  } = req.body;

  // check if product exist
  const product = await getProductById(+productId);
  if (!product) {
    if (req.files && req.files.length > 0) {
      const originalFiles = req.files.map((file: any) => file.filename);
      await removeFiles(originalFiles, null);
    }
    return next(
      createError("This data model does not exist.", 409, errorCode.invalid)
    );
  }

  let originalFileNames = [];
  if (req.files && req.files.length > 0) {
    originalFileNames = req.files.map((file: any) => ({
      path: file.filename,
    }));
  }

  const data: any = {
    name,
    description,
    price,
    discount,
    inventory: +inventory,
    category,
    type,
    tags,
    images: originalFileNames,
  };

  if (req.files && req.files.length > 0) {
    await Promise.all(
      req.files.map(async (file: any) => {
        // no extension, just filename
        const splitFileName = file.filename.split(".")[0];

        // add job to Queue
        return ImageQueue.add(
          "optimize-image",
          {
            filePath: file?.path,
            fileName: `${splitFileName}.webp`,
            width: 835,
            height: 577,
            quality: 100,
          },
          {
            attempts: 3, // max attempts
            backoff: {
              type: "exponential",
              delay: 1000,
            },
          }
        );
      })
    );

    // Deleting Old Images
    const oldFiles = product.images.map((img) => img.path); // original images
    const optFiles = product.images.map(
      (img) => img.path.split(".")[0] + ".webp"
    ); // optimized images

    console.log("oldFiles", oldFiles);
    console.log("optFiles", optFiles);

    await removeFiles(oldFiles, optFiles);
  }

  const updatedProduct = await updateOneProduct(+product.id, data);

  // invalidate cache after creating a new post
  await CacheQueue.add(
    "invalidate-post-cache",
    {
      pattern: "posts:*", // invalidate ( delete ) all posts
    },
    {
      jobId: `invalidate-${Date.now()}`, // unique job id
      priority: 1, // high priority
    }
  );

  res.status(200).json({
    message: "Successfully updated the product.",
    productId: updatedProduct.id,
  });
};
