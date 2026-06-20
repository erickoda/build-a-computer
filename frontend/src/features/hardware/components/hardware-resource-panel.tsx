'use client';

import { Input, toast } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import { HardwareResourceConfig } from '../config';
import { useCreateHardware } from '../hooks/useCreateHardware';
import { useDeleteHardware } from '../hooks/useDeleteHardware';
import { useHardwareList } from '../hooks/useHardwareList';
import { useUpdateHardware } from '../hooks/useUpdateHardware';
import { CreateHardwareModal } from './create-hardware-modal';
import { HardwareTable } from './hardware-table';

type HardwareItem = { id: string };

type HardwareResourcePanelProps<TResponse extends HardwareItem, TCreate> = {
  resource: HardwareResourceConfig<TResponse, TCreate>;
  canManage: boolean;
};

export function HardwareResourcePanel<TResponse extends HardwareItem, TCreate>({
  resource,
  canManage,
}: HardwareResourcePanelProps<TResponse, TCreate>) {
  const { items, isLoading, error, fetchItems } = useHardwareList(resource.api.list);
  const { isLoading: isCreating, error: createError, createItem } = useCreateHardware(resource.api.create);
  const { isLoading: isUpdating, error: updateError, updateItem } = useUpdateHardware(resource.api.update);
  const { isLoading: isDeleting, error: deleteError, deleteItem } = useDeleteHardware(resource.api.remove);

  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;

    const query = search.trim().toLowerCase();

    return items.filter((item) =>
      resource.searchableColumns.some((key) => String(item[key]).toLowerCase().includes(query)),
    );
  }, [items, search, resource.searchableColumns]);

  async function handleCreate(dto: TCreate): Promise<boolean> {
    const isSuccess = await createItem(dto);

    if (isSuccess) {
      toast.success(`${resource.label} created successfully!`);
      await fetchItems();
      return true;
    }

    toast.danger(`Error while creating ${resource.label}`, {
      description: createError?.message || 'Verify the inputed data and try again.',
    });
    return false;
  }

  async function handleUpdate(id: string, dto: TCreate): Promise<boolean> {
    const isSuccess = await updateItem(id, dto);

    if (isSuccess) {
      toast.success(`${resource.label} updated successfully!`);
      await fetchItems();
      return true;
    }

    toast.danger(`Error while updating ${resource.label}`, {
      description: updateError?.message || 'Verify the inputed data and try again.',
    });
    return false;
  }

  async function handleDelete(id: string) {
    const isSuccess = await deleteItem(id);

    if (isSuccess) {
      toast.success(`${resource.label} deleted successfully!`);
      await fetchItems();
    } else {
      toast.danger(`Error while deleting ${resource.label}`, {
        description: deleteError?.message || 'Please try again later.',
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder={`Search ${resource.label.toLowerCase()}s…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {canManage && (
          <CreateHardwareModal
            resourceLabel={resource.label}
            fields={resource.fields}
            onConfirm={handleCreate}
            isLoading={isCreating}
          />
        )}
      </div>

      <HardwareTable<TResponse, TCreate>
        items={filteredItems}
        columns={resource.columns}
        isLoading={isLoading}
        error={error}
        canDelete={canManage}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        itemLabel={(item) => resource.columns[0].render(item)?.toString() ?? resource.label}
        resourceLabel={resource.label}
        editFields={resource.fields}
        isUpdating={isUpdating}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
