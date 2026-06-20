"use client";

import { Modal, Button, Input, Label, TextField, ErrorMessage } from "@heroui/react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateGameRequestDto } from "../types/dtos";
import { GameFormValues, gameSchema } from "../schemas/gameSchema";
import { bytesToDataUrl, fileToByteArray } from "../utils/imageBytes";

interface CreateGameModalProps {
  onConfirm: (data: CreateGameRequestDto) => Promise<boolean>;
  isLoading: boolean;
}

const CreateGameModal = ({ onConfirm, isLoading }: CreateGameModalProps) => {
  const [img, setImg] = useState<number[] | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      necessary_disk: "",
    },
  });

  const handleImageChange = async (file: File | undefined) => {
    if (!file) {
      setImg(null);
      return;
    }

    setImg(await fileToByteArray(file));
  };

  const onSubmit = async (data: GameFormValues) => {
    const payload: CreateGameRequestDto = {
      name: data.name,
      necessary_disk: Number(data.necessary_disk),
      img,
    };

    const isSuccess = await onConfirm(payload);

    if (isSuccess) {
      reset();
      setImg(null);
    }
  };

  const isBusy = isLoading || isSubmitting;
  const isSaveDisabled = isBusy || !isValid;

  return (
    <Modal>
      <Button variant="outline">
        + New Game
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[400px]">
            <Modal.CloseTrigger />

            <form onSubmit={handleSubmit(onSubmit)} className="font-sans">
              <Modal.Header>
                <Modal.Heading>New Game</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-4">
                <div className="flex flex-col space-y-1">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField isInvalid={!!errors.name}>
                        <Label className="text-xs font-bold tracking-wide">Name</Label>
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
                    {errors.name && <>{errors.name.message}</>}
                  </ErrorMessage>
                </div>

                <div className="flex flex-col space-y-1">
                  <Controller
                    name="necessary_disk"
                    control={control}
                    render={({ field }) => (
                      <TextField isInvalid={!!errors.necessary_disk}>
                        <Label className="text-xs font-bold tracking-wide">Necessary Disk (GB)</Label>
                        <Input
                          {...field}
                          type="number"
                          variant="secondary"
                          disabled={isBusy}
                          className="bg-gray-100 dark:bg-zinc-800"
                        />
                      </TextField>
                    )}
                  />
                  <ErrorMessage className="text-xs text-danger">
                    {errors.necessary_disk && <>{errors.necessary_disk.message}</>}
                  </ErrorMessage>
                </div>

                <div className="flex flex-col space-y-1">
                  <Label className="text-xs font-bold tracking-wide">Image (optional)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isBusy}
                    onChange={(e) => handleImageChange(e.target.files?.[0])}
                    className="text-sm"
                  />
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={bytesToDataUrl(img)}
                      alt="Game preview"
                      className="mt-2 h-24 w-24 rounded-lg object-cover"
                    />
                  )}
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
                  Create Game
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default CreateGameModal;
