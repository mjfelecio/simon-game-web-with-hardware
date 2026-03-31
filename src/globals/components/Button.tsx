import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/globals/libs/styleUtils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center rounded-full border transition-all duration-300 font-header uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "border-gray-300 bg-transparent text-white shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:bg-slate-100 hover:text-black",
        secondary: "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
        danger: "border-red-400 text-red-400 hover:bg-red-400 hover:text-white shadow-none",
        ghost: "border-transparent text-white hover:bg-white/10",
      },
      size: {
        default: "px-8 py-4 text-2xl",
        sm: "px-8 py-2 text-lg",
        icon: "h-14 w-14",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: true,
    },
  }
);

interface ButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  text?: string;
}

const Button = ({ className, variant, size, fullWidth, text, children, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {text || children}
    </button>
  );
};

export default Button;