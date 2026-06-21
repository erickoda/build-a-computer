"use client";

import { toast, Table, Button, Spinner, Input, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { Squares2X2Icon, TableCellsIcon } from "@heroicons/react/16/solid";
import { useEffect, useMemo, useState } from "react";
import { useRole } from "@/src/hooks/use-role";
import { ConfirmDeleteModal } from "@/src/components/confirm-delete-modal";
import useFetchGames from "../hooks/fetchGames";
import useDeleteGame from "../hooks/deleteGame";
import useCreateGame from "../hooks/createGame";
import useUpdateGame from "../hooks/updateGame";
import { CreateGameRequestDto, UpdateGameRequestDto, GameResponseDto } from "../types/dtos";
import CreateGameModal from "./create-game-modal";
import { UpdateGameModal } from "./update-game-modal";
import { GameCard } from "./game-card";

type View = 'table' | 'grid';

const GamesPage = () => {
  const role = useRole();
  const canManage = role === 'admin' || role === 'supervisor';

  const { games, isLoading, error, fetchGames } = useFetchGames();
  const { isLoading: isLoadingDeleteGame, error: errorDeleteGame, deleteGameRequest } = useDeleteGame();
  const { isLoading: isLoadingCreateGame, error: errorCreateGame, createGameRequest } = useCreateGame();
  const { isLoading: isLoadingUpdateGame, error: errorUpdateGame, updateGameRequest } = useUpdateGame();

  const [view, setView] = useState<View>('grid');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const filteredGames = useMemo(() => {
    if (!search.trim()) return games;

    const query = search.trim().toLowerCase();

    return games.filter((game) => game.name.toLowerCase().includes(query));
  }, [games, search]);

  const handleUpdateGame = async (gameId: string, data: UpdateGameRequestDto): Promise<boolean> => {
    const isSuccess = await updateGameRequest(gameId, data);

    if (isSuccess) {
      toast.success("Game updated successfully!");
      await fetchGames();
      return true;
    } else {
      toast.danger('Error while updating game', {
        description: errorUpdateGame?.message || "Verify the inputed data and try again.",
      });
      return false;
    }
  };

  const confirmDelete = async (gameId: string) => {
    const isSuccess = await deleteGameRequest(gameId);

    if (isSuccess) {
      toast.success("Game deleted successfully!");
      await fetchGames();
    } else {
      toast.danger('An error occurred while deleting game', {
        description: errorDeleteGame?.message || "Please try again later.",
      });
    }
  };

  const handleCreateGame = async (data: CreateGameRequestDto): Promise<boolean> => {
    const isSuccess = await createGameRequest(data);

    if (isSuccess) {
      toast.success("Created game successfully!");
      await fetchGames();
      return true;
    } else {
      toast.danger('Error while creating game', {
        description: errorCreateGame?.message || "Verify the inputed data and try again.",
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
          <Button variant="outline" className="mt-4 dark:text-red-900" onPress={() => fetchGames()}>
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
            Games Catalog
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Browse the games available for PC build recommendations
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search games…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[view]}
          onSelectionChange={(keys) => {
            const next = Array.from(keys)[0] as View | undefined;
            if (next) setView(next);
          }}
          size="sm"
        >
          <ToggleButton id="table" aria-label="Table view">
            <TableCellsIcon className="size-4" />
          </ToggleButton>
          <ToggleButton id="grid" aria-label="Card view">
            <Squares2X2Icon className="size-4" />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {view === 'table' ? (
        <div className="w-full rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm overflow-x-auto">
          <Table>
            <Table.Content
              aria-label="List of catalog games"
              className="min-w-[700px]"
            >
              <Table.Header>
                <Table.Column isRowHeader className="px-4 pb-4">NAME</Table.Column>
                <Table.Column className="px-4 pb-4">NECESSARY DISK (GB)</Table.Column>
                {canManage && <Table.Column className="px-4 pb-4 text-center">ACTIONS</Table.Column>}
              </Table.Header>

              <Table.Body items={filteredGames}>
                {(game: GameResponseDto) => (
                  <Table.Row key={game.id} className="hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-colors rounded-lg">
                    <Table.Cell className="px-4 py-4 font-medium">{game.name}</Table.Cell>
                    <Table.Cell className="px-4 py-4 text-gray-500">{game.necessary_disk}</Table.Cell>
                    {canManage && (
                      <Table.Cell className="px-4 py-4 text-center flex justify-center gap-2">
                        <UpdateGameModal
                          game={game}
                          onConfirm={handleUpdateGame}
                          isLoading={isLoadingUpdateGame}
                        />
                        <ConfirmDeleteModal
                          description={
                            <p>
                              Are you sure you want to delete <strong>{game.name}</strong>?
                            </p>
                          }
                          onConfirm={() => confirmDelete(game.id)}
                          isLoading={isLoadingDeleteGame}
                        />
                      </Table.Cell>
                    )}
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              actions={
                canManage && (
                  <>
                    <UpdateGameModal
                      game={game}
                      onConfirm={handleUpdateGame}
                      isLoading={isLoadingUpdateGame}
                    />
                    <ConfirmDeleteModal
                      description={
                        <p>
                          Are you sure you want to delete <strong>{game.name}</strong>?
                        </p>
                      }
                      onConfirm={() => confirmDelete(game.id)}
                      isLoading={isLoadingDeleteGame}
                    />
                  </>
                )
              }
            />
          ))}
        </div>
      )}

      {canManage && (
        <div className="flex justify-end mt-4">
          <CreateGameModal
            onConfirm={handleCreateGame}
            isLoading={isLoadingCreateGame}
          />
        </div>
      )}
    </div>
  );
}

export default GamesPage;
