export type GameResponseDto = {
  id: string;
  name: string;
  img?: number[] | null;
  necessary_disk: number;
  created_at: string;
  updated_at?: string;
};

export type CreateGameRequestDto = {
  name: string;
  img?: number[] | null;
  necessary_disk: number;
};

export type UpdateGameRequestDto = {
  name: string;
  img?: number[] | null;
  necessary_disk: number;
};
