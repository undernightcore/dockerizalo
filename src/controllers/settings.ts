import { RequestHandler } from "express";
import { castToType } from "../helpers/cast";
import { authenticateUser } from "../services/auth";
import { prisma } from "../services/prisma";
import { updateSettingValidator } from "../validators/setting/update-setting";

export const getSettings: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const settings = await prisma.setting.findMany();
  const converted = settings.map((setting) => ({
    ...setting,
    value: castToType(setting.value, setting.type),
  }));

  res.status(200).json(converted);
};

export const editSetting: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const setting = await prisma.setting.findUnique({
    where: { id: req.params.settingId },
  });
  if (!setting) {
    res.status(404).json({ message: "Setting not found" });
    return;
  }

  const data = updateSettingValidator(setting.type).parse(req.body);

  const updated = await prisma.setting.update({
    where: { id: req.params.settingId },
    data,
  });

  res
    .status(200)
    .json({ ...updated, value: castToType(updated.value, updated.type) });
};
