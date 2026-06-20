'use client';

import { PhotoIcon } from '@heroicons/react/16/solid';
import { GameResponseDto } from '../types/dtos';
import { bytesToDataUrl } from '../utils/imageBytes';

type GameCardProps = {
  game: GameResponseDto;
  actions?: React.ReactNode;
};

export function GameCard({ game, actions }: GameCardProps) {
  const imageUrl = bytesToDataUrl(game.img);

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground transition-colors hover:border-foreground/20">
      <div className="flex aspect-video items-center justify-center overflow-hidden bg-muted/30">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={game.name} className="h-full w-full object-cover" />
        ) : (
          <PhotoIcon className="size-10 text-muted-foreground" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="truncate text-sm font-medium">{game.name}</p>
        <p className="text-xs text-muted-foreground">
          {game.necessary_disk}GB required disk space
        </p>

        {actions && (
          <div className="mt-auto flex justify-end gap-2 pt-2">{actions}</div>
        )}
      </div>
    </article>
  );
}
