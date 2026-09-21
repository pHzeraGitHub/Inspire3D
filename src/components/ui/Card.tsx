import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Ativa elevação + borda dourada no hover. */
  interactive?: boolean;
};

export function Card({ className, interactive = true, children, ...props }: CardProps) {
  return (
    <div className={cn("card", interactive && "card--hover", className)} {...props}>
      {interactive ? <span aria-hidden className="card__glow" /> : null}
      {children}
    </div>
  );
}
