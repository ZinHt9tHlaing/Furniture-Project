import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

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
