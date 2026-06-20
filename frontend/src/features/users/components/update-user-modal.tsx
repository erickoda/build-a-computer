"use client";

import { Modal, Button, Input, Label, TextField, ErrorMessage, Select, ListBox } from "@heroui/react";
import { PencilSquareIcon } from "@heroicons/react/16/solid";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleValues, statusValues, UpdateUserRequestDto, UserResponseDto, UserRole, UserStatus } from "../types/dtos";
import { UpdateFormValues, updateUserSchema } from "../schemas/updateUserSchema";

interface UpdateUserModalProps {
  user: UserResponseDto;
  onConfirm: (userId: string, data: UpdateUserRequestDto) => Promise<boolean>;
  isLoading: boolean;
}

export const UpdateUserModal = ({ user, onConfirm, isLoading }: UpdateUserModalProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
    values: {
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });

  const onSubmit = async (data: UpdateFormValues) => {
    const payload: UpdateUserRequestDto = {
      username: data.username,
      email: data.email,
      role: data.role as UserRole,
      status: data.status as UserStatus,
    };

    await onConfirm(user.id, payload);
  };

  const isBusy = isLoading || isSubmitting;
  const isSaveDisabled = isBusy || !isValid;

  return (
    <Modal>
      <Button size="sm" variant="outline">
        <PencilSquareIcon className="h-4 w-4" />
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[400px]">
            <Modal.CloseTrigger />

            <form onSubmit={handleSubmit(onSubmit)} className="font-sans">
              <Modal.Header>
                <Modal.Heading>Update User</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-4">

                <div className="flex flex-col space-y-1">
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <TextField isInvalid={!!errors.username}>
                        <Label className="text-xs font-bold tracking-wide">Username</Label>
                        <Input
                          {...field}
                          variant="secondary"
                          disabled={isBusy}
                          className="bg-gray-100 dark:bg-zinc-800"
                        />
                      </TextField>
                    )}
                  />
                  <ErrorMessage className="text-xs text-danger">
                    {errors.username && <>{errors.username.message}</>}
                  </ErrorMessage>
                </div>

                <div className="flex flex-col space-y-1">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField isInvalid={!!errors.email}>
                        <Label className="text-xs font-bold tracking-wide">E-mail</Label>
                        <Input
                          {...field}
                          variant="secondary"
                          type="email"
                          disabled={isBusy}
                          className="bg-gray-100 dark:bg-zinc-800"
                        />
                      </TextField>
                    )}
                  />
                  <ErrorMessage className="text-xs text-danger">
                    {errors.email && <>{errors.email.message}</>}
                  </ErrorMessage>
                </div>

                <div className="flex flex-col space-y-1">
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        className="w-full"
                        variant="secondary"
                        isInvalid={!!errors.role}
                        isDisabled={isBusy}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <Label className="text-xs font-bold tracking-wide">Role</Label>
                        <Select.Trigger className="bg-gray-100 dark:bg-zinc-800 rounded-xl">
                          <Select.Value className="capitalize" />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox aria-label="Role">
                            {roleValues.map((roleValue) => (
                              <ListBox.Item key={roleValue} id={roleValue} textValue={roleValue} className="capitalize">
                                {roleValue}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  />
                  <ErrorMessage className="text-xs text-danger">
                    {errors.role && <>{errors.role.message}</>}
                  </ErrorMessage>
                </div>

                <div className="flex flex-col space-y-1">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        className="w-full"
                        variant="secondary"
                        isInvalid={!!errors.status}
                        isDisabled={isBusy}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <Label className="text-xs font-bold tracking-wide">Status</Label>
                        <Select.Trigger className="bg-gray-100 dark:bg-zinc-800 rounded-xl">
                          <Select.Value className="capitalize" />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox aria-label="Status">
                            {statusValues.map((statusValue) => (
                              <ListBox.Item key={statusValue} id={statusValue} textValue={statusValue} className="capitalize">
                                {statusValue}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  />
                  <ErrorMessage className="text-xs text-danger">
                    {errors.status && <>{errors.status.message}</>}
                  </ErrorMessage>
                </div>

              </Modal.Body>

              <Modal.Footer>
                <Button variant="ghost" slot="close" isDisabled={isBusy}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  isPending={isBusy}
                  isDisabled={isSaveDisabled}
                >
                  Save Changes
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
