import { SettingType } from "@prisma/client";
import { boolean, number, object, string } from "zod";

export const updateSettingValidator = (type: SettingType) =>
  ({
    [SettingType.STRING]: object({
      value: string({
        required_error: "A value is required",
        invalid_type_error: "This setting value must be a string",
      }),
    }),
    [SettingType.INTEGER]: object({
      value: number({
        required_error: "A value is required",
        invalid_type_error: "This setting value must be a number",
      })
        .int("This setting value must be an integer")
        .transform((value) => String(value)),
    }),
    [SettingType.BOOLEAN]: object({
      value: boolean({
        required_error: "A value is required",
        invalid_type_error: "This setting value must be a boolean",
      }).transform((value) => String(value)),
    }),
  })[type];
