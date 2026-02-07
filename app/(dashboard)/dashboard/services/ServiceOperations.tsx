"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteListing } from "@/features/listings/actions";

interface ServiceOperationsProps {
  serviceId: string;
}

export function ServiceOperations({ serviceId }: ServiceOperationsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteListing(serviceId);
      if (result.success) {
        toast.success("服务已删除");
        router.refresh();
      } else {
        toast.error(result.error || "删除失败");
      }
    } catch (error) {
      toast.error("操作失败，请稍后重试");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => router.push(`/dashboard/listings/new?id=${serviceId}`)}
      >
        <Edit2 className="mr-1 size-3" />
        编辑
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-1 size-3 animate-spin" />
            ) : (
              <Trash2 className="mr-1 size-3" />
            )}
            删除
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除此服务吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，删除后该服务将不再对其他用户可见。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              variant="destructive"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
