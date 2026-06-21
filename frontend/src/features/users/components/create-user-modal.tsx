"use client";

import { Modal, Button, Input, Label, TextField, ErrorMessage, Select, ListBox } from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserRequestDto, roleValues, UserRole } from "../types/dtos";
import { CreateFormValues, createUserSchema } from "../schemas/createUserSchema";

interface CreateUserModalProps {
  onConfirm: (data: CreateUserRequestDto) => Promise<boolean>;
  isLoading: boolean;
}

const CreateUserModal = ({ onConfirm, isLoading }: CreateUserModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: UserRole.Common,
    },
  });

  const onSubmit = async (data: CreateFormValues) => {
    const payload: CreateUserRequestDto = {
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role as UserRole,
    };

    const isSuccess = await onConfirm(payload);

    if (isSuccess) {
      reset();
    }
  };

  const isBusy = isLoading || isSubmitting;
  const isSaveDisabled = isBusy || !isValid;

  return (
    <Modal>
      <Button variant="outline">
        + New User
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[400px]">
            <Modal.CloseTrigger />

            <form onSubmit={handleSubmit(onSubmit)} className="font-sans">
              <Modal.Header>
                <Modal.Heading>New User</Modal.Heading>
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
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField isInvalid={!!errors.password}>
                        <Label className="text-xs font-bold tracking-wide">Password</Label>
                        <Input
                          {...field}
                          variant="secondary"
                          type="password"
                          disabled={isBusy}
                          className="bg-gray-100 dark:bg-zinc-800"
                        />
                      </TextField>
                    )}
                  />
                  <ErrorMessage className="text-xs text-danger">
                    {errors.password && <>{errors.password.message}</>}
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
                  Create User
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default CreateUserModal;
