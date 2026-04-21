import React from 'react';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9bbd0] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-[#11151d] text-[#f5f7fb] border border-[#11151d] shadow-[0_10px_24px_rgba(17,21,29,0.22)] hover:-translate-y-0.5 hover:bg-[#1a2230]",
        secondary: "bg-[#eef2f7] text-[#151a22] border border-[#d6dfeb] hover:bg-[#e4eaf3]",
        ghost: "bg-transparent text-[#485264] hover:text-[#12161d] hover:bg-[#e9eef6]",
        glass: "bg-white/85 border border-white text-[#151a22] shadow-[0_10px_20px_rgba(16,24,40,0.08)] hover:bg-white",
        danger: "bg-[#fbe8ef] text-[#9b2f4f] border border-[#f4cad8] hover:bg-[#f7dce7]",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3.5 rounded-xl text-xs",
        lg: "h-14 px-8 rounded-[20px] text-base",
        icon: "size-12",
      },
      glow: {
        true: "",
        false: "",
      }
    },
    compoundVariants: [
      { variant: 'primary', glow: true, className: 'shadow-[0_12px_28px_rgba(21,26,34,0.34)]' },
      { variant: 'glass', glow: true, className: 'shadow-[0_12px_26px_rgba(16,24,40,0.14)]' },
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
