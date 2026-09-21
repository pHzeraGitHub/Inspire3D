import { cn } from "@/lib/utils";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  /** Adiciona o fundo grafite (alterna o ritmo vertical da página). */
  tone?: "void" | "graphite";
};

export function Section({ className, tone = "void", children, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        // overflow-x-clip contém os halos decorativos sem quebrar `position: sticky`
        "relative overflow-x-clip py-(--spacing-section)",
        tone === "graphite" && "bg-graphite/60",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
