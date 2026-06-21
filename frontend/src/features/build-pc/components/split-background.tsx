import { Game } from '../types/game';

type SplitBackgroundProps = { games: Game[] };

const SEAM_WIDTH = 80;

export function SplitBackground({ games: selectedGames }: SplitBackgroundProps) {
  const count = selectedGames.length;
  const widthPct = count > 0 ? 100 / count : 100;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* One panel per game */}
      {selectedGames.map((game, i) => (
        <div
          key={game.id}
          className="absolute top-0 h-full bg-cover bg-center"
          style={{
            backgroundImage: game.bannerUrl
              ? `url('${game.bannerUrl}')`
              : undefined,
            width: `${widthPct}%`,
            left: `${i * widthPct}%`,
            transition:
              'width 800ms cubic-bezier(0.4,0,0.2,1), left 600ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      ))}

      {/* Seams — one per internal boundary, rendered as siblings so they are
          never clipped by a panel's own box. Each seam is centred on the
          boundary using calc() so it tracks the % position during the
          CSS transition without needing JS scroll listeners. */}
      {selectedGames.slice(0, -1).map((game, i) => (
        <div
          key={`seam-${game.id}`}
          className="absolute -top-10 h-full pointer-events-none"
          style={{
            width: SEAM_WIDTH,
            left: `calc(${(i + 1) * widthPct}% - ${SEAM_WIDTH / 2}px)`,
            transition: 'left 600ms cubic-bezier(0.4,0,0.2,1)',
            background: 'light-dark(#f8f8f8f0, #040404f0)',
            filter: 'blur(21px)',
          }}
        />
      ))}
    </div>
  );
}
