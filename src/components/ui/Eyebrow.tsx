import { cn } from "@/lib/utils";

export function Eyebrow({
  className,
  tone = "gold",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "gold" | "silver" }) {
  return (
    <span className={cn("eyebrow", tone === "silver" && "eyebrow--silver", className)} {...props}>
      {children}
    </span>
  );
}
