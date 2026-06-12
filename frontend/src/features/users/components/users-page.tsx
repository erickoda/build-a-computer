"use client";

import { toast, Table, Button, Spinner } from "@heroui/react";
import { useEffect } from "react";
import useFetchUsers from "../hooks/fetchUsers";
import useDeleteUser from "../hooks/deleteUser";
import useCreateUser from "../hooks/createUser";
import useUpdateUser from "../hooks/updateUser";
import { CreateUserRequestDto, UpdateUserRequestDto, UserResponseDto } from "../types/dtos";
import DeleteUserModal from "./delete-user-modal";
import CreateUserModal from "./create-user-modal";
import { UpdateUserModal } from "./update-user-modal";

const UsersPage = () => {
  const { users, isLoading, error, fetchUsers } = useFetchUsers();
  const { isLoading: isLoadingDeleteUser, error: errorDeleteUser, deleteUserRequest } = useDeleteUser();
  const { isLoading: isLoadingCreateUser, error: errorCreateUser, createUserRequest } = useCreateUser();
  const { isLoading: isLoadingUpdateUser, error: errorUpdateUser, updateUserRequest } = useUpdateUser();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = async (userId: string, data: UpdateUserRequestDto): Promise<boolean> => {
    const isSuccess = await updateUserRequest(userId, data);

    if (isSuccess) {
      toast.success("User updated successfully!");
      await fetchUsers();
      return true;
    } else {
      toast.danger('Error while updating user', {
        description: errorUpdateUser?.message || "Verify the inputed data and try again.",
      });
      return false;
    }
  };

  const confirmDelete = async (userId: string) => {
    const isSuccess = await deleteUserRequest(userId);

    if (isSuccess) {
      toast.success("Account deleted successfully!");
      await fetchUsers();
    } else {
      toast.danger('An error occurred while deleting user', {
        description: errorDeleteUser?.message || "Please try again later.",
      });
    }
  };

  const handleCreateUser = async (data: CreateUserRequestDto): Promise<boolean> => {
    const isSuccess = await createUserRequest(data);

    if (isSuccess) {
      toast.success("Created user successfully!");
      await fetchUsers();
      return true;
    } else {
      toast.danger('Error while creating user', {
        description: errorCreateUser?.message || "Verify the inputed data and try again.",
      });
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <div className="text-lg font-medium text-gray-500 animate-pulse">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-8 py-10">
        <div className="rounded-xl bg-red-50 p-6 border border-red-200 text-red-700 shadow-sm">
          <h3 className="text-lg font-bold mb-2">Failed to fetch data</h3>
          <p>{error.message}</p>
          <Button variant="outline" className="mt-4" onPress={() => fetchUsers()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-8 md:px-16 py-12 flex flex-col gap-4 p-6">

      <div className="w-full flex flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Users Managers
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            View, manage and update the platform's profiles
          </p>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-x-auto">
        <Table aria-label="Lista de usuários da plataforma">
          <Table.Content className="min-w-[700px]">
            <Table.Header>
              <Table.Column className="px-4 pb-4">NAME</Table.Column>
              <Table.Column isRowHeader className="px-4 pb-4">E-MAIL</Table.Column>
              <Table.Column className="px-4 pb-4">ROLE</Table.Column>
              <Table.Column className="px-4 pb-4">STATUS</Table.Column>
              <Table.Column className="px-4 pb-4 text-center">ACTIONS</Table.Column>
            </Table.Header>

            <Table.Body items={users}>
              {(user: UserResponseDto) => (
                <Table.Row key={user.id} className="hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-colors rounded-lg">
                  <Table.Cell className="px-4 py-4 font-medium">{user.username}</Table.Cell>
                  <Table.Cell className="px-4 py-4 text-gray-500">{user.email}</Table.Cell>
                  <Table.Cell className="px-4 py-4 capitalize">{user.role.toUpperCase()}</Table.Cell>
                  <Table.Cell className="px-4 py-4">{user.status.toUpperCase()}</Table.Cell>
                  <Table.Cell className="px-4 py-4 text-center flex justify-center gap-2">

                    <UpdateUserModal
                      user={user}
                      onConfirm={handleUpdateUser}
                      isLoading={isLoadingUpdateUser}
                    />

                    <DeleteUserModal
                      user={user}
                      onConfirm={confirmDelete}
                      isLoading={isLoadingDeleteUser}
                    />

                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table>
      </div>

      <div className="flex justify-end mt-4">
        <CreateUserModal
          onConfirm={handleCreateUser}
          isLoading={isLoadingCreateUser}
        />
      </div>

    </div>
  );
}

export default UsersPage;
