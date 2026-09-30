import GamesPage from "@/src/features/games/components/games-page";
import { baseOpenGraph } from "@/src/utils/seo";
import type { Metadata } from "next";

const description =
  "Browse the games in our benchmark library and see which titles we use to size a gaming PC build for your resolution, quality and budget.";

export const metadata: Metadata = {
  title: "Games",
  description,
  alternates: { canonical: "/games" },
  openGraph: { ...baseOpenGraph, url: "/games", title: "Games | Build a Computer", description },
  twitter: { title: "Games | Build a Computer", description },
};

const Games = () => {
  return (
    <GamesPage />
  )
}

export default Games;
