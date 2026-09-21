import { cn } from "@/lib/utils";

export function Chip({
  className,
  tone = "silver",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "silver" | "gold" }) {
  return (
    <span className={cn("chip", tone === "gold" && "chip--gold", className)} {...props}>
      {children}
    </span>
  );
}
