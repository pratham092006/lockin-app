import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, type, label, error, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "lv-input",
          error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-bold text-red-400 mt-1 ml-2">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
