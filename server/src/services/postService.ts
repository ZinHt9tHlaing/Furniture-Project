import { prisma } from "./prismaClient";

export type PostType = {
  title: string;
  content: string;
  body: string;
  image: string;
  authorId: number;
  category: string;
  type: string;
  tags: string[];
};

export const createOnePost = async (postData: PostType) => {
  let data: any = {
    title: postData.title,
    content: postData.content,
    body: postData.body,
    image: postData.image,

    // one to many
    author: {
      connect: { id: postData.authorId },
    },

    // one to many
    category: {
      connectOrCreate: {
        where: { name: postData.category },
        create: {
          name: postData.category,
        },
      },
    },

    // one to many
    type: {
      connectOrCreate: {
        where: { name: postData.type },
        create: {
          name: postData.type,
        },
      },
    },
  };

  // many to many
  if (postData.tags && postData.tags.length > 0) {
    data.tags = {
      connectOrCreate: postData.tags.map((tagName: string) => ({
        where: { name: tagName },
        create: { name: tagName },
      })),
    };
  }

  return prisma.post.create({
    data,
  });
};

export const getPostById = async (id: number) => {
  return await prisma.post.findUnique({ where: { id } });
};

export const updateOnePost = async (postId: number, postData: PostType) => {
  let data: any = {
    title: postData.title,
    content: postData.content,
    body: postData.body,

    // one to many
    category: {
      connectOrCreate: {
        where: { name: postData.category },
        create: {
          name: postData.category,
        },
      },
    },

    // one to many
    type: {
      connectOrCreate: {
        where: { name: postData.type },
        create: {
          name: postData.type,
        },
      },
    },
  };

  if (postData.image) {
    data.image = postData.image;
  }

  // many to many
  if (postData.tags && postData.tags.length > 0) {
    data.tags = {
      connectOrCreate: postData.tags.map((tagName: string) => ({
        where: { name: tagName },
        create: { name: tagName },
      })),
    };
  }

  return await prisma.post.update({
    where: { id: postId },
    data,
  });
};

export const deleteOnePost = async (id: number) => {
  return await prisma.post.delete({
    where: { id },
  });
};

export const getPostWithRelations = async (id: number) => {
  return prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      body: true,
      image: true,
      updatedAt: true,
      author: {
        select: {
          // firstName: true,
          // lastName: true,
          fullName: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      type: {
        select: {
          name: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
    },
  });
};

// for Pagination
export const getPostsList = async (options: any) => {
  return await prisma.post.findMany(options);
};
