import { prisma } from "./prismaClient";

export const createOneProduct = async (data: any) => {
  const productData: any = {
    name: data.name,
    description: data.description,
    price: data.price,
    discount: data.discount,
    inventory: data.inventory,
    category: {
      connectOrCreate: {
        where: { name: data.category },
        create: {
          name: data.category,
        },
      },
    },
    type: {
      connectOrCreate: {
        where: { name: data.type },
        create: {
          name: data.type,
        },
      },
    },
    images: {
      create: data.images,
    },
  };

  if (data.tags && data.tags.length > 0) {
    productData.tags = {
      connectOrCreate: data.tags.map((tagName: string) => ({
        where: { name: tagName },
        create: {
          name: tagName,
        },
      })),
    };
  }
  return prisma.product.create({ data: productData });
};

export const getProductById = async (id: number) => {
  return prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
};

export const updateOneProduct = async (productId: number, data: any) => {
  const productData: any = {
    name: data.name,
    description: data.description,
    price: data.price,
    discount: data.discount,
    inventory: data.inventory,
    category: {
      connectOrCreate: {
        where: { name: data.category },
        create: {
          name: data.category,
        },
      },
    },
    type: {
      connectOrCreate: {
        where: { name: data.type },
        create: {
          name: data.type,
        },
      },
    },
  };

  // many to many
  if (data.tags && data.tags.length > 0) {
    productData.tags = {
      set: [],
      connectOrCreate: data.tags.map((tagName: string) => ({
        where: { name: tagName },
        create: {
          name: tagName,
        },
      })),
    };
  }

  // one to many
  if (data.images && data.images.length > 0) {
    // if images exist, delete all and create new
    productData.images = {
      deleteMany: {}, // delete all images
      create: data.images,
    };
  }

  return prisma.product.update({
    where: { id: productId },
    data: productData,
    include: { images: true },
  });
};

export const deleteOneProduct = async (id: number) => {
  return prisma.product.delete({ where: { id } });
};

export const getProductWithRelations = async (id: number) => {
  return prisma.product.findUnique({
    where: { id },
    omit: {
      categoryId: true,
      typeId: true,
      createdAt: true,
      updatedAt: true,
    },
    include: {
      images: {
        select: {
          id: true,
          path: true,
        },
      },
    },
  });
};

// for Pagination
export const getProductsList = async (options: any) => {
  return await prisma.product.findMany(options);
};
