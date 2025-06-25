import { Setting, SettingType } from "@prisma/client";
import { boolean, number, object, string } from "zod";

export const updateSettingValidator = (setting: Setting) =>
  ({
    [SettingType.STRING]: object({
      value: string({
        required_error: "A value is required",
        invalid_type_error: "This setting value must be a string",
      })
        .min(
          setting.min ?? -Infinity,
          `The length must be greater or equal to ${setting.min}`
        )
        .max(
          setting.max ?? Infinity,
          `The length must be less or equal to ${setting.max}`
        ),
    }),
    [SettingType.INTEGER]: object({
      value: number({
        required_error: "A value is required",
        invalid_type_error: "This setting value must be a number",
      })
        .int("This setting value must be an integer")
        .min(
          setting.min ?? -Infinity,
          `The value must be greater or equal to ${setting.min}`
        )
        .max(
          setting.max ?? Infinity,
          `The value must be less or equal to ${setting.max}`
        )
        .transform((value) => String(value)),
    }),
    [SettingType.BOOLEAN]: object({
      value: boolean({
        required_error: "A value is required",
        invalid_type_error: "This setting value must be a boolean",
      }).transform((value) => String(value)),
    }),
  }[setting.type]);
