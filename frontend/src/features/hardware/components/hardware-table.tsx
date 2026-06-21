'use client';

import { ConfirmDeleteModal } from '@/src/components/confirm-delete-modal';
import { Spinner, Table } from '@heroui/react';
import { EditHardwareModal } from './edit-hardware-modal';
import { ColumnConfig, FieldConfig } from '../types/fieldConfig';

type HardwareItem = { id: string };

type HardwareTableProps<T extends HardwareItem, TUpdate> = {
  items: T[];
  columns: ColumnConfig<T>[];
  isLoading: boolean;
  error?: { message: string };
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (id: string) => void;
  itemLabel: (item: T) => string;
  resourceLabel: string;
  editFields: FieldConfig[];
  isUpdating: boolean;
  onUpdate: (id: string, dto: TUpdate) => Promise<boolean>;
};

export function HardwareTable<T extends HardwareItem, TUpdate>({
  items,
  columns,
  isLoading,
  error,
  canDelete,
  isDeleting,
  onDelete,
  itemLabel,
  resourceLabel,
  editFields,
  isUpdating,
  onUpdate,
}: HardwareTableProps<T, TUpdate>) {
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 border border-red-200 text-red-700 shadow-sm">
        <h3 className="text-lg font-bold mb-2">Failed to fetch data</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center text-sm text-muted-foreground">
        No items found.
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-x-auto">
      <Table>
        <Table.Content aria-label="Hardware catalog" className="min-w-[700px]">
          <Table.Header>
            {columns.map((column, index) => (
              <Table.Column key={column.key} isRowHeader={index === 0} className="px-4 pb-4">
                {column.label.toUpperCase()}
              </Table.Column>
            ))}
            {canDelete && <Table.Column className="px-4 pb-4 text-center">ACTIONS</Table.Column>}
          </Table.Header>

          <Table.Body items={items}>
            {(item: T) => (
              <Table.Row key={item.id} className="hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-colors rounded-lg">
                {columns.map((column) => (
                  <Table.Cell key={column.key} className="px-4 py-4">
                    {column.render(item)}
                  </Table.Cell>
                ))}
                {canDelete && (
                  <Table.Cell className="px-4 py-4 text-center flex justify-center gap-2">
                    <EditHardwareModal<T, TUpdate>
                      resourceLabel={resourceLabel}
                      fields={editFields}
                      item={item}
                      onConfirm={(dto) => onUpdate(item.id, dto)}
                      isLoading={isUpdating}
                    />
                    <ConfirmDeleteModal
                      description={
                        <p>
                          Are you sure you want to delete <strong>{itemLabel(item)}</strong>?
                        </p>
                      }
                      onConfirm={() => onDelete(item.id)}
                      isLoading={isDeleting}
                    />
                  </Table.Cell>
                )}
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table>
    </div>
  );
}
