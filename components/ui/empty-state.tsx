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
    <div className="flex flex-col items-center justify-center py-12">
      {Icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm text-center">
        {description}
      </p>
      {buttonContent}
    </div>
  );
}