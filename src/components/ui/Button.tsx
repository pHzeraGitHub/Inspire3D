import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  gold: "btn--gold",
  outline: "btn--outline",
  ghost: "btn--ghost",
};

const sizeClass: Record<Size, string> = {
  sm: "btn--sm",
  md: "",
  lg: "btn--lg",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
  onClick?: () => void;
  type?: never;
};

type NativeProps = CommonProps & {
  href?: never;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
};

export type ButtonProps = LinkProps | NativeProps;

const isLink = (props: ButtonProps): props is LinkProps => typeof props.href === "string";

/**
 * Botão único do sistema. Renderiza <Link>, <a> ou <button>
 * conforme o uso, mantendo a mesma linguagem visual.
 */
export function Button(props: ButtonProps) {
  const classes = cn(
    "btn",
    variantClass[props.variant ?? "gold"],
    sizeClass[props.size ?? "md"],
    props.className,
  );

  if (isLink(props)) {
    const { href, external, onClick, children } = props;
    const isProtocol = /^(mailto:|tel:)/.test(href);
    const isExternal = external || isProtocol || /^https?:/.test(href);

    if (isExternal) {
      // mailto:/tel: abrem no app do sistema — target="_blank" só deixaria
      // uma aba em branco para trás.
      return (
        <a
          href={href}
          className={classes}
          onClick={onClick}
          target={isProtocol ? undefined : "_blank"}
          rel={isProtocol ? undefined : "noopener noreferrer"}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      aria-label={props["aria-label"]}
    >
      {props.children}
    </button>
  );
}
