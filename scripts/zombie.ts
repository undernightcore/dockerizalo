// This script cleans any zombie builds that are left in BUILDING status

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const clearZombieBuilds = async () => {
  const builds = await prisma.build.findMany({ where: { status: "BUILDING" } });

  await prisma.$transaction(
    builds.map((build) =>
      prisma.build.update({
        where: { id: build.id },
        data: { status: "FAILED", finishedAt: build.updatedAt },
      })
    )
  );

  return builds.length;
};

clearZombieBuilds().then((builds) => {
  console.log(`Successfully fixed ${builds} builds`);
  process.exit(0);
});
