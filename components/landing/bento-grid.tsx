"use client";

import { cn } from "@/lib/utils/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto ",
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
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-2xl group/bento transition duration-200 p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-900 border-b-4 border-b-gray-300 dark:border-b-gray-900 justify-between flex flex-col space-y-4",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon}
        <div className="font-sans font-bold text-[#4b4b4b] dark:text-white mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-[#777777] dark:text-gray-400 text-sm">
          {description}
        </div>
      </div>
    </div>
  );
};
