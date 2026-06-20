"use client";

import { Button, Modal } from "@heroui/react";
import { TrashIcon } from "@heroicons/react/16/solid";

interface ConfirmDeleteModalProps {
  title?: string;
  description: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export function ConfirmDeleteModal({
  title = "Confirm Deletion",
  description,
  confirmLabel = "Yes, delete",
  onConfirm,
  isLoading,
  trigger,
}: ConfirmDeleteModalProps) {
  return (
    <Modal>
      {trigger ?? (
        <Button size="sm" variant="danger">
          <TrashIcon className="h-4 w-4 text-white" />
        </Button>
      )}

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[400px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>

            <Modal.Body>{description}</Modal.Body>

            <Modal.Footer>
              <Button variant="ghost" slot="close" isDisabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onPress={() => onConfirm()}
                isPending={isLoading}
              >
                {confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
