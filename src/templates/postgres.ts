import { randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { TemplateInterface } from ".";
import { slug } from "../helpers/slug";

export const postgresTemplate: TemplateInterface = {
  name: "Postgres",
  image: "postgres",
  icon: "https://cdn.jsdelivr.net/gh/selfhst/icons/svg/postgresql.svg",
  description:
    "Object-relational database management system that supports an extended subset of the SQL standard",
  ports: () => [],
  variables: async (app) => [
    {
      key: "POSTGRES_USER",
      value: slug(app.name, "_"),
      build: false,
      appId: app.id,
    },
    {
      key: "POSTGRES_PASSWORD",
      value: await promisify(randomBytes)(32).then((random) =>
        random.toString("hex")
      ),
      build: false,
      appId: app.id,
    },
  ],
  volumes: (app) => [
    { host: "./db", internal: "/var/lib/postgresql/data", appId: app.id },
  ],
  networks: (app) => [
    { name: slug(app.name, "_") + "_network", external: false, appId: app.id },
  ],
};
