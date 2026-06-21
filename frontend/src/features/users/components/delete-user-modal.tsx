"use client";

import { ConfirmDeleteModal } from "@/src/components/confirm-delete-modal";
import { UserResponseDto } from "../types/dtos";

interface DeleteUserModalProps {
  user: UserResponseDto;
  onConfirm: (userId: string) => Promise<void>;
  isLoading: boolean;
}

const DeleteUserModal = ({ user, onConfirm, isLoading }: DeleteUserModalProps) => {
  return (
    <ConfirmDeleteModal
      description={
        <p>
          Are you sure you want to delete the <strong>{user.username}</strong>?
        </p>
      }
      confirmLabel="Yes, delete user"
      onConfirm={() => onConfirm(user.id)}
      isLoading={isLoading}
    />
  );
};

export default DeleteUserModal;
