"use client";

import { useFormStatus } from "react-dom";

export function AuthSubmitButton({
  pendingText,
  idleText,
}: {
  pendingText: string;
  idleText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-black text-white py-2 disabled:opacity-60"
    >
      {pending ? pendingText : idleText}
    </button>
  );
}
