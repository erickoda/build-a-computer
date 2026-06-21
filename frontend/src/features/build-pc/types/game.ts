// Selectable game backed by the real catalog. `bannerUrl` is the game's
// uploaded image (decoded from its byte array) used to fill the background —
// games without an uploaded image simply render no background art for their
// panel, since not every catalog game is guaranteed to have one.

export type Game = {
  id: string;
  name: string;
  bannerUrl?: string;
};
