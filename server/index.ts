import { PrismaClient, Prisma } from "./generated/prisma";
import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// const userData: Prisma.UserCreateInput[] = [
//   {
//     phone: "778661260",
//     password: "",
//     randomToken: "sfwfx23rbkxg982ntxf87",
//   },
//   {
//     phone: "778661261",
//     password: "",
//     randomToken: "sfwfx23rbkxg982ntxf87",
//   },
//   {
//     phone: "778661262",
//     password: "",
//     randomToken: "sfwfx23rbkxg982ntxf87",
//   },
//   {
//     phone: "778661263",
//     password: "",
//     randomToken: "sfwfx23rbkxg982ntxf87",
//   },
//   {
//     phone: "778661264",
//     password: "",
//     randomToken: "sfwfx23rbkxg982ntxf87",
//   },
// ];

const createRandomUser = () => {
  return {
    phone: faker.phone.number({ style: "international" }),
    password: "",
    randomToken: faker.internet.jwt(),
  };
};

export const userData = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

async function main() {
  console.log(`Start seeding ...`);
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("12345678", salt);

  for (const user of userData) {
    user.password = password;
    await prisma.user.create({
      data: user,
    });
  }
  console.log(`Seeding finished.`);
}

// main()
//   .then(async () => {
//     console.log(`Disconnecting from database`);
//     await prisma.$disconnect();
//   })
//   .catch(async (error) => {
//     console.error("Error seeding the database", error);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
