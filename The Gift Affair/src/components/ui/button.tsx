import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-plum text-cream hover:bg-plum/90",
        coral: "bg-coral text-plum hover:bg-coral/85",
        outline: "border-[1.5px] border-plum/80 text-plum hover:bg-plum hover:text-cream",
        ghost: "text-plum hover:bg-plum/8",
        danger: "bg-danger text-white hover:bg-danger/90",
        light: "bg-surface text-plum hover:bg-cream",
      },
      size: {
        sm: "min-h-9 px-4 text-sm",
        md: "min-h-11 px-5 text-[0.95rem]",
        lg: "min-h-13 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
