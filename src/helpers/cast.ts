import { SettingType } from "@prisma/client";

export const castToType = (value: string, type: SettingType) =>
  ({
    [SettingType.INTEGER]: (value: string) => Number(value),
    [SettingType.BOOLEAN]: (value: string) => value === "true",
    [SettingType.STRING]: (value: string) => value,
  })[type](value);
