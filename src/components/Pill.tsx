import Link from "next/link";
import type { ReactNode, MouseEventHandler } from "react";

type Variant = "white" | "red" | "dark" | "ghost" | "ghost-light" | "link";
type Size = "lg" | "md" | "sm" | "xs";

type Props = {
  href?: string;
  variant?: Variant;
  size?: Size;
  arrow?: ReactNode | boolean;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: "button" | "submit";
  external?: boolean;
  mag?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  download?: string;
};

/** Pill button / link. The `arrow` prop renders the round arrow bubble on the right. */
export default function Pill({ href, variant = "white", size, arrow, children, className = "", onClick, type = "button", external, mag, disabled, style, download }: Props) {
  const cls = ["pill", "pill--" + variant, size ? "pill--" + size : "", arrow ? "pill--arrow" : "", className].filter(Boolean).join(" ");
  const inner = (
    <>
      <span>{children}</span>
      {arrow ? (
        <span className="pill__arrow" aria-hidden="true">
          {arrow === true ? "→" : arrow}
        </span>
      ) : null}
    </>
  );
  const magAttr = mag ? { "data-mag": "" } : {};
  if (href) {
    if (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("data:")) {
      return (
        <a href={href} className={cls} onClick={onClick} style={style} download={download} {...magAttr} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} onClick={onClick} style={style} {...magAttr}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} style={style} {...magAttr}>
      {inner}
    </button>
  );
}
