import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  href,
  onAction,
}: EmptyStateProps) {
  const buttonContent = actionLabel && (
    <div className="mt-6">
      {href ? (
        <Link href={href}>
          <Button>{actionLabel}</Button>
        </Link>
      ) : (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-6 group transition-all duration-300">
          <Icon className="w-10 h-10 text-slate-300 group-hover:text-primary/40 transition-colors" />
        </div>
      )}
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>
      {buttonContent}
    </div>
  );
}