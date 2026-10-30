import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "border-primaria bg-primaria font-semibold text-texto-na-primaria",
        outline: "border-primaria bg-transparent text-texto",
        ghost: "border-borda bg-superficie text-texto",
      },
      size: {
        sm: "px-4 text-sm",
        lg: "w-full px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
  };

export function Button({
  variant,
  size,
  loading = false,
  iconLeft,
  iconRight,
  className,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const spinnerOnRight = Boolean(iconRight) && !iconLeft;
  const spinner = (
    <Loader2 aria-hidden="true" className="size-5 animate-spin motion-reduce:animate-none" />
  );

  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span role="status" className="sr-only">
          Carregando
        </span>
      ) : null}
      {loading && !spinnerOnRight ? spinner : iconLeft}
      {children}
      {loading && spinnerOnRight ? spinner : iconRight}
    </button>
  );
}
