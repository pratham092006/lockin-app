import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const GlassCard = React.forwardRef(({ children, className, hover = true, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-[24px] bg-[#f6f7f8] border border-white shadow-[0_14px_32px_rgba(16,24,40,0.08)] overflow-hidden",
        hover && "hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(16,24,40,0.12)] transition-all duration-300",
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
});

GlassCard.displayName = "GlassCard";

export { GlassCard };
