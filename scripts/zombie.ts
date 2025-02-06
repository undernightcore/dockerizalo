// This script cleans any zombie builds that are left in BUILDING status

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  console.log(`Sucessfully fixed ${builds} builds`);
  process.exit(0);
});
