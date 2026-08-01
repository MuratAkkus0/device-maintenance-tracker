import { z } from "zod";
import { DEVICE_TYPE_VALUES } from "../constants/devices.js";

const MAC_ADDRESS_PATTERN = /^([0-9A-Fa-f]{2}([-:])){5}([0-9A-Fa-f]{2})$/;

const isoDate = (fieldName) =>
  z
    .string({ error: `${fieldName} is required.` })
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: `${fieldName} must be a valid date.`,
    });

const baseDeviceShape = {
  type: z.enum(DEVICE_TYPE_VALUES, {
    error: `type must be one of: ${DEVICE_TYPE_VALUES.join(", ")}.`,
  }),
  macAddress: z
    .string()
    .trim()
    .regex(MAC_ADDRESS_PATTERN, "macAddress must look like 00:1A:2B:3C:4D:5E.")
    .optional()
    .or(z.literal("")),
  purchaseDate: isoDate("purchaseDate"),
  lastServiceDate: isoDate("lastServiceDate"),
  maintenanceIntervalMonths: z
    .number({ error: "maintenanceIntervalMonths is required." })
    .int("maintenanceIntervalMonths must be a whole number.")
    .min(1, "maintenanceIntervalMonths must be at least 1.")
    .max(60, "maintenanceIntervalMonths must be at most 60."),
  ownerStaffId: z.number().int().positive().optional(),
  roomId: z.number().int().positive().optional(),
  technicianId: z
    .number({ error: "technicianId is required." })
    .int()
    .positive(),
};

function requireLocationForType(data, ctx) {
  if (data.type === "LAPTOP" && !data.ownerStaffId) {
    ctx.addIssue({
      code: "custom",
      path: ["ownerStaffId"],
      message: "ownerStaffId is required for laptops.",
    });
  }
  if (data.type === "DESKTOP" && !data.roomId) {
    ctx.addIssue({
      code: "custom",
      path: ["roomId"],
      message: "roomId is required for desktop computers.",
    });
  }
}

export const createDeviceSchema = z
  .object(baseDeviceShape)
  .superRefine(requireLocationForType);

export const updateDeviceSchema = z
  .object(baseDeviceShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });
