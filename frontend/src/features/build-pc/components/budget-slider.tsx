export const BUDGET_MIN = 500;
export const BUDGET_MAX = 10000;
export const BUDGET_STEP = 50;

type BudgetSliderProps = {
  value: [number, number];
  onChange: (v: [number, number]) => void;
};

export function BudgetSlider({ value, onChange }: BudgetSliderProps) {
  const pctLow = ((value[0] - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
  const pctHigh = ((value[1] - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  function handleLow(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value), value[1] - BUDGET_STEP);
    onChange([v, value[1]]);
  }

  function handleHigh(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value), value[0] + BUDGET_STEP);
    onChange([value[0], v]);
  }

  const rangeClass = [
    'absolute w-full appearance-none bg-transparent',
    'pointer-events-none',
    '[&::-webkit-slider-thumb]:appearance-none',
    '[&::-webkit-slider-thumb]:pointer-events-auto',
    '[&::-webkit-slider-thumb]:size-4',
    '[&::-webkit-slider-thumb]:rounded-full',
    '[&::-webkit-slider-thumb]:bg-black dark:[&::-webkit-slider-thumb]:bg-white',
    '[&::-webkit-slider-thumb]:border-2',
    '[&::-webkit-slider-thumb]:border-black/20',
    '[&::-webkit-slider-thumb]:shadow-md',
    '[&::-webkit-slider-thumb]:cursor-grab',
    '[&::-webkit-slider-thumb]:active:cursor-grabbing',
    '[&::-webkit-slider-runnable-track]:bg-transparent',
    '[&::-moz-range-thumb]:pointer-events-auto',
    '[&::-moz-range-thumb]:size-4',
    '[&::-moz-range-thumb]:rounded-full',
    '[&::-moz-range-thumb]:bg-black dark:[&::-moz-range-thumb]:bg-white',
    '[&::-moz-range-thumb]:border-2',
    '[&::-moz-range-thumb]:border-black/20',
    '[&::-moz-range-thumb]:cursor-grab',
    '[&::-moz-range-track]:bg-transparent',
  ].join(' ');

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative flex h-5 items-center">
        <div className="absolute h-1 w-full rounded-full bg-black/20 dark:bg-white/20" />
        <div
          className="absolute h-1 rounded-full bg-black dark:bg-white transition-all duration-75"
          style={{ left: `${pctLow}%`, right: `${100 - pctHigh}%` }}
        />
        <input
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={value[0]}
          onChange={handleLow}
          style={{ zIndex: value[0] >= value[1] - BUDGET_STEP ? 5 : 3 }}
          className={rangeClass}
        />
        <input
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={value[1]}
          onChange={handleHigh}
          style={{ zIndex: 4 }}
          className={rangeClass}
        />
      </div>
      <div className="flex justify-between text-xs text-black/40 dark:text-white/40">
        <span>${BUDGET_MIN.toLocaleString()}</span>
        <span>${BUDGET_MAX.toLocaleString()}</span>
      </div>
    </div>
  );
}
