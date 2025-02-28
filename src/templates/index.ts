import {
  App,
  BindMount,
  EnvironmentVariable,
  Network,
  PortMapping,
} from "@prisma/client";
import { postgresTemplate } from "./postgres";

type MaybePromise<T> = Promise<T> | T;

export interface TemplateInterface {
  name: string;
  description: string;
  image: string;
  icon: string; // Get SVG icon from https://selfh.st/icons/
  ports: (app: App) => MaybePromise<Omit<PortMapping, "id">[]>;
  volumes: (app: App) => MaybePromise<Omit<BindMount, "id">[]>;
  variables: (app: App) => MaybePromise<Omit<EnvironmentVariable, "id">[]>;
  networks: (app: App) => MaybePromise<Omit<Network, "id">[]>;
}

export const templates: TemplateInterface[] = [postgresTemplate];
