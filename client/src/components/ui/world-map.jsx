"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function WorldMap({
  dots = [],
  lineColor = "#0ea5e9"
}) {
  const svgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [svgMap, setSvgMap] = useState('');
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Generate map only once and cache it
  useEffect(() => {
    if (isVisible && !mapInstanceRef.current && typeof window !== 'undefined') {
      // Delay map generation to not block initial page load
      const timer = setTimeout(() => {
        try {
          const DottedMapClass = require("dotted-map").default;
          const map = new DottedMapClass({ height: 60, grid: "diagonal" });

          // Detect dark mode
          const isDarkMode = document.documentElement.classList.contains('dark');
          const dotColor = isDarkMode ? "#FFFFFF40" : "#00000040";

          const svg = map.getSVG({
            radius: 0.2,
            color: dotColor,
            shape: "circle",
            backgroundColor: "transparent",
          });

          mapInstanceRef.current = svg;
          setSvgMap(svg);
        } catch (error) {
          console.error('Error generating map:', error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Intersection Observer to load map only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isVisible]);

  const projectPoint = (lat, lng) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (start, end) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[2/1] bg-white dark:bg-black rounded-lg relative font-sans"
    >
      {!svgMap ? (
        // Placeholder while map loads
        <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-neutral-500">Loading world map...</p>
          </div>
        </div>
      ) : (
        <>
          {svgMap && (
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
              className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
              alt="world map"
              height="495"
              width="1056"
              draggable={false}
              loading="lazy"
            />
          )}
          <svg
            ref={svgRef}
            viewBox="0 0 800 400"
            className="w-full h-full absolute inset-0 pointer-events-none select-none"
          >
            {dots.map((dot, i) => {
              const startPoint = projectPoint(dot.start.lat, dot.start.lng);
              const endPoint = projectPoint(dot.end.lat, dot.end.lng);
              return (
                <g key={`path-group-${i}`}>
                  <motion.path
                    d={createCurvedPath(startPoint, endPoint)}
                    fill="none"
                    stroke="url(#path-gradient)"
                    strokeWidth="1"
                    initial={{
                      pathLength: 0,
                    }}
                    animate={{
                      pathLength: 1,
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.5 * i,
                      ease: "easeOut",
                    }}
                  />
                </g>
              );
            })}

            <defs>
              <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
                <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>

            {dots.map((dot, i) => (
              <g key={`points-group-${i}`}>
                <g key={`start-${i}`}>
                  <circle
                    cx={projectPoint(dot.start.lat, dot.start.lng).x}
                    cy={projectPoint(dot.start.lat, dot.start.lng).y}
                    r="2"
                    fill={lineColor}
                  />
                  <circle
                    cx={projectPoint(dot.start.lat, dot.start.lng).x}
                    cy={projectPoint(dot.start.lat, dot.start.lng).y}
                    r="2"
                    fill={lineColor}
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="2"
                      to="8"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
                <g key={`end-${i}`}>
                  <circle
                    cx={projectPoint(dot.end.lat, dot.end.lng).x}
                    cy={projectPoint(dot.end.lat, dot.end.lng).y}
                    r="2"
                    fill={lineColor}
                  />
                  <circle
                    cx={projectPoint(dot.end.lat, dot.end.lng).x}
                    cy={projectPoint(dot.end.lat, dot.end.lng).y}
                    r="2"
                    fill={lineColor}
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="2"
                      to="8"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              </g>
            ))}
          </svg>
        </>
      )}
    </div>
  );
}
