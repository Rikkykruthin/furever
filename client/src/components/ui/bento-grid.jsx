"use client";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export const BentoGrid = ({
  className,
  children
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[20rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-2xl transition-all duration-300 shadow-lg dark:shadow-none dark:bg-black dark:border-white/[0.2] bg-white border border-neutral-200 dark:border-neutral-800 justify-between flex flex-col space-y-4 hover:-translate-y-1 cursor-pointer overflow-hidden relative",
        className
      )}
    >
      {/* Glowing cursor effect - must be first */}
      <GlowingEffect
        spread={80}
        glow={true}
        disabled={false}
        proximity={120}
        inactiveZone={0.01}
      />

      {/* Content wrapper with padding */}
      <div className="relative z-10 p-4 flex flex-col h-full space-y-4">
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500 -translate-x-full group-hover/bento:translate-x-full transform transition-transform duration-1000 pointer-events-none"></div>
        
        {header}
        <div className="group-hover/bento:translate-x-2 transition-all duration-300 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            {icon && (
              <div className="p-2 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 rounded-lg group-hover/bento:scale-110 transition-transform duration-300">
                {icon}
              </div>
            )}
            <div className="font-sans font-bold text-neutral-800 dark:text-neutral-100 text-lg">
              {title}
            </div>
          </div>
          <div className="font-sans font-normal text-neutral-600 text-sm dark:text-neutral-400 leading-relaxed">
            {description}
          </div>
        </div>
      </div>
      
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300 pointer-events-none z-[5]"></div>
    </div>
  );
};
