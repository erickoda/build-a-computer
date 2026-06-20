"use client";

import { Modal, Button, Input, Label, TextField, ErrorMessage } from "@heroui/react";
import { PencilSquareIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GameResponseDto, UpdateGameRequestDto } from "../types/dtos";
import { GameFormValues, gameSchema } from "../schemas/gameSchema";
import { bytesToDataUrl, fileToByteArray } from "../utils/imageBytes";

interface UpdateGameModalProps {
  game: GameResponseDto;
  onConfirm: (gameId: string, data: UpdateGameRequestDto) => Promise<boolean>;
  isLoading: boolean;
}

export const UpdateGameModal = ({ game, onConfirm, isLoading }: UpdateGameModalProps) => {
  const [syncedImg, setSyncedImg] = useState<number[] | null | undefined>(game.img);
  const [img, setImg] = useState<number[] | null>(game.img ?? null);

  if (game.img !== syncedImg) {
    setSyncedImg(game.img);
    setImg(game.img ?? null);
  }

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameSchema),
    mode: "onChange",
    values: {
      name: game.name,
      necessary_disk: String(game.necessary_disk),
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
    const payload: UpdateGameRequestDto = {
      name: data.name,
      img,
      necessary_disk: Number(data.necessary_disk),
    };

    await onConfirm(game.id, payload);
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
                <Modal.Heading>Update Game</Modal.Heading>
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
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bytesToDataUrl(img)}
                        alt="Game preview"
                        className="mt-2 h-24 w-24 rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        isDisabled={isBusy}
                        onPress={() => setImg(null)}
                      >
                        Remove
                      </Button>
                    </div>
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
