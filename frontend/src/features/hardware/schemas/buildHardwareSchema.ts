import { z } from 'zod';
import { FieldConfig } from '../types/fieldConfig';

export function buildHardwareSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    switch (field.kind) {
      case 'boolean':
        shape[field.name] = z.boolean();
        break;
      case 'number':
      case 'integer':
        shape[field.name] = field.required
          ? z
              .string()
              .min(1, `${field.label} is required`)
              .refine((v) => !Number.isNaN(Number(v)), `${field.label} must be a number`)
          : z.string().optional();
        break;
      default:
        shape[field.name] = field.required
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
        break;
    }
  }

  return z.object(shape);
}

export function emptyValuesFor(fields: FieldConfig[]): Record<string, string | boolean> {
  const values: Record<string, string | boolean> = {};

  for (const field of fields) {
    values[field.name] = field.kind === 'boolean' ? false : '';
  }

  return values;
}

export function valuesFor<TItem>(
  fields: FieldConfig[],
  item: TItem,
): Record<string, string | boolean> {
  const values: Record<string, string | boolean> = {};

  for (const field of fields) {
    const value = (item as Record<string, unknown>)[field.name];

    switch (field.kind) {
      case 'boolean':
        values[field.name] = Boolean(value);
        break;
      case 'date':
        values[field.name] = value ? String(value).slice(0, 10) : '';
        break;
      default:
        values[field.name] = value === null || value === undefined ? '' : String(value);
        break;
    }
  }

  return values;
}

export function toPayload<TCreate>(fields: FieldConfig[], values: Record<string, string | boolean>): TCreate {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const value = values[field.name];

    switch (field.kind) {
      case 'boolean':
        payload[field.name] = Boolean(value);
        break;
      case 'number':
        payload[field.name] = Number(value);
        break;
      case 'integer':
        payload[field.name] = parseInt(String(value), 10);
        break;
      case 'date':
        payload[field.name] = new Date(String(value)).toISOString();
        break;
      default:
        payload[field.name] = value;
        break;
    }
  }

  return payload as TCreate;
}
