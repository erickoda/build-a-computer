'use client';

import { Field } from '@/src/components/form-field';
import { PencilIcon } from '@heroicons/react/16/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, ListBox, Modal, Select, Switch } from '@heroui/react';
import { useState } from 'react';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { buildHardwareSchema, toPayload, valuesFor } from '../schemas/buildHardwareSchema';
import { FieldConfig } from '../types/fieldConfig';

type EditHardwareModalProps<TItem, TUpdate> = {
  resourceLabel: string;
  fields: FieldConfig[];
  item: TItem;
  onConfirm: (dto: TUpdate) => Promise<boolean>;
  isLoading: boolean;
};

export function EditHardwareModal<TItem, TUpdate>({
  resourceLabel,
  fields,
  item,
  onConfirm,
  isLoading,
}: EditHardwareModalProps<TItem, TUpdate>) {
  const [schema] = useState(() => buildHardwareSchema(fields));
  const [defaultValues] = useState(() => valuesFor(fields, item));

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Record<string, string | boolean>>({
    resolver: zodResolver(schema) as Resolver<Record<string, string | boolean>>,
    mode: 'onChange',
    defaultValues,
  });

  const onSubmit = async (values: Record<string, string | boolean>) => {
    const payload = toPayload<TUpdate>(fields, values);
    await onConfirm(payload);
  };

  return (
    <Modal>
      <Button size="sm" variant="outline">
        <PencilIcon className="h-4 w-4" />
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-120">
            <Modal.CloseTrigger />

            <form onSubmit={handleSubmit(onSubmit)} className="font-sans">
              <Modal.Header>
                <Modal.Heading>Edit {resourceLabel}</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
                {fields.map((field) => (
                  <Controller
                    key={field.name}
                    name={field.name}
                    control={control}
                    render={({ field: formField }) => {
                      const error = errors[field.name]?.message as string | undefined;

                      if (field.kind === 'boolean') {
                        return (
                          <Field label={field.label} error={error}>
                            <Switch
                              isSelected={Boolean(formField.value)}
                              onChange={formField.onChange}
                              isDisabled={isLoading}
                            >
                              <Switch.Control>
                                <Switch.Thumb />
                              </Switch.Control>
                            </Switch>
                          </Field>
                        );
                      }

                      if (field.kind === 'select') {
                        return (
                          <Field label={field.label} htmlFor={field.name} error={error} required={field.required}>
                            <Select
                              value={formField.value as string}
                              onChange={formField.onChange}
                              isDisabled={isLoading}
                              isInvalid={!!error}
                            >
                              <Select.Trigger className="rounded-xl bg-gray-100 dark:bg-zinc-800">
                                <Select.Value className="capitalize" />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover>
                                <ListBox aria-label={field.label}>
                                  {(field.options ?? []).map((option) => (
                                    <ListBox.Item key={option} id={option} textValue={option} className="capitalize">
                                      {option}
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                  ))}
                                </ListBox>
                              </Select.Popover>
                            </Select>
                          </Field>
                        );
                      }

                      return (
                        <Field label={field.label} htmlFor={field.name} error={error} required={field.required}>
                          <Input
                            id={field.name}
                            type={field.kind === 'number' || field.kind === 'integer' ? 'number' : field.kind === 'date' ? 'date' : 'text'}
                            step={field.kind === 'number' ? 'any' : undefined}
                            disabled={isLoading}
                            name={formField.name}
                            value={formField.value as string}
                            onChange={formField.onChange}
                            onBlur={formField.onBlur}
                          />
                        </Field>
                      );
                    }}
                  />
                ))}
              </Modal.Body>

              <Modal.Footer>
                <Button variant="ghost" slot="close" isDisabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isPending={isLoading} isDisabled={isLoading || !isValid}>
                  Save changes
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
