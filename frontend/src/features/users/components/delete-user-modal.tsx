"use client";

import { Button, Modal } from "@heroui/react";
import { UserResponseDto } from "../types/dtos";
import { TrashIcon } from "@heroicons/react/16/solid";

interface DeleteUserModalProps {
  user: UserResponseDto;
  onConfirm: (userId: string) => Promise<void>;
  isLoading: boolean;
}

const DeleteUserModal = ({ user, onConfirm, isLoading }: DeleteUserModalProps) => {
  return (
    <Modal>
      <Button size="sm" variant="danger">
        <TrashIcon className="h-4 w-4 text-white" />
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[400px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Confirm Deletion</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <p>
                Are you sure you want to delete the <strong>{user.username}</strong>?
              </p>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="ghost" slot="close" isDisabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onPress={() => onConfirm(user.id)}
                isPending={isLoading}
              >
                Yes, delete user
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default DeleteUserModal;
