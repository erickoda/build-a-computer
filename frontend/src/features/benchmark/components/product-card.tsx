import type { Benchmark } from "@/src/utils/benchmarks"
import { Badge } from "./ui/badge"
// import { Star } from "lucide-react"
import { cn } from "@/src/utils/utils"
import { StarIcon } from "@heroicons/react/16/solid"

type BenchmarkCardProps = {
  product: Benchmark
}

export function ProductCard({ product }: BenchmarkCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground transition-colors hover:border-foreground/20">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
            !product.inStock && "opacity-60",
          )}
        />
        {!product.inStock && (
          <Badge
            variant="secondary"
            className="absolute left-3 top-3"
          >
            Out of stock
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <h3 className="text-pretty text-sm font-medium leading-snug">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <StarIcon className="size-3.5 fill-current text-foreground" />
          <span className="tabular-nums">{product.rating.toFixed(1)}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{product.category}</span>
        </div>
        <p className="mt-3 text-base font-semibold tabular-nums">
          ${product.price}
        </p>
      </div>
    </article>
  )
}
