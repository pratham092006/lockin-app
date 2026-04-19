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
        "relative rounded-2xl bg-[#141414] border border-white/5 shadow-lg overflow-hidden",
        hover && "hover:border-white/10 transition-all duration-300",
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
