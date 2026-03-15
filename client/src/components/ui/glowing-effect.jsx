"use client";

import { useEffect, useRef, useState } from "react";

export function GlowingEffect({
  spread = 40,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
}) {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    if (disabled) return;

    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: -1000, y: -1000 });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-0"
      style={{
        maskImage: "radial-gradient(circle, white, transparent)",
        WebkitMaskImage: "radial-gradient(circle, white, transparent)",
      }}
    >
      {glow && (
        <div
          className="absolute w-full h-full"
          style={{
            background: `radial-gradient(${proximity}px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
            opacity: mousePosition.x > -100 ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
      )}
    </div>
  );
}
