"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

// Use type over interface (project convention)
export type TimelineEntry = {
  title: string;
  content: React.ReactNode;
};

export type TimelineProps = {
  data: TimelineEntry[];
  activeIndex?: number;
  idPrefix?: string;
  containerId?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  scrollable?: boolean;
  maxHeight?: number | string;
};

export const Timeline = ({
  data,
  activeIndex = 0,
  idPrefix = "timeline",
  containerId,
  title = "Changelog from my journey",
  subtitle = "I've been working on Aceternity for the past 2 years. Here's a timeline of my journey.",
  className = "",
  scrollable = false,
  maxHeight = "60vh",
}: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      id={containerId}
      className={`w-full bg-white dark:bg-neutral-950 font-sans md:px-10 ${className}`}
      ref={containerRef}
      style={scrollable ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight, overflowY: 'auto' } : undefined}
    >
      <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 lg:px-10">
        {title && (
          <h2 className="text-lg md:text-3xl mb-2 text-black dark:text-white max-w-4xl">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-sm">
            {subtitle}
          </p>
        )}
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            id={`${idPrefix}-item-${index}`}
            className="flex justify-start pt-10 md:pt-32 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div className={`h-4 w-4 rounded-full border p-2 ${
                  index === activeIndex
                    ? "bg-gradient-to-r from-emerald-400 to-blue-400 border-emerald-300"
                    : "bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                }`} />
              </div>
              <h3
                className={`hidden md:block text-xl md:pl-20 md:text-5xl font-bold transition-colors ${
                  index === activeIndex
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-500"
                }`}
              >
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3
                className={`md:hidden block text-2xl mb-4 text-left font-bold transition-colors ${
                  index === activeIndex
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-500"
                }`}
              >
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
