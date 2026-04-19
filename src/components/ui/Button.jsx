import React from 'react';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-[#CCFF00] text-[#121212] shadow-[0_4px_16px_rgba(204,255,0,0.2)] hover:bg-[#D4FF33] hover:shadow-[0_8px_24px_rgba(204,255,0,0.4)] hover:-translate-y-0.5",
        secondary: "bg-white/10 text-white border border-white/10 hover:bg-white/20",
        ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
        glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 shadow-xl",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4 rounded-xl text-[10px]",
        lg: "h-14 px-10 rounded-[20px]",
        icon: "size-12",
      },
      glow: {
        true: "",
        false: "",
      }
    },
    compoundVariants: [
      { variant: 'primary', glow: true, className: 'shadow-[0_0_20px_rgba(204,255,0,0.3)]' },
      { variant: 'glass', glow: true, className: 'shadow-[0_0_20px_rgba(0,255,255,0.1)]' },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
      glow: false,
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, glow, asChild = false, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.96 }}
      className={cn(buttonVariants({ variant, size, glow, className }))}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
