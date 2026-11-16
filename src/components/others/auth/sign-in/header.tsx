import { cn } from "@/utils";

export interface SignInHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function SignInHeader({
  title = "E-SPK",
  description,
  className,
}: SignInHeaderProps) {
  return (
    <div className={cn("mb-5 sm:mb-8", className)}>
      <h1 className="text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}
