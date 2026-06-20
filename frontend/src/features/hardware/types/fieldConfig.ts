import type { ReactNode } from 'react';

export type FieldKind = 'text' | 'number' | 'integer' | 'boolean' | 'select' | 'date';

export type FieldConfig = {
  name: string;
  label: string;
  kind: FieldKind;
  options?: readonly string[];
  required?: boolean;
};

export type ColumnConfig<T> = {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
};
