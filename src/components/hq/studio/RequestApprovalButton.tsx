import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useRequestStudioApproval,
  useStudioApprovalGates,
  type RequestApprovalInput,
} from "@/hooks/useStudio";
import type { StudioApprovalGates } from "@/lib/studio-types";

interface RequestApprovalButtonProps {
  gateKey: keyof StudioApprovalGates;
  input: RequestApprovalInput;
  label?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default";
  className?: string;
}

/**
 * Button that triggers a presidential approval request only when the
 * corresponding gate is enabled in `studio_approval_gates`. When the gate
 * is disabled, it simply notifies the user that no approval is required.
 */
export function RequestApprovalButton({
  gateKey,
  input,
  label = "Demander validation présidentielle",
  disabled,
  variant = "default",
  size = "default",
  className,
}: RequestApprovalButtonProps) {
  const { toast } = useToast();
  const { data: gates } = useStudioApprovalGates();
  const request = useRequestStudioApproval();
  const gateEnabled = !!gates?.[gateKey];

  const handleClick = () => {
    if (!gateEnabled) {
      toast({
        title: "Aucune validation requise",
        description:
          "La porte d'approbation est désactivée pour ce type d'action. Vous pouvez l'activer dans Approbations Studio.",
      });
      return;
    }
    request.mutate(input);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || request.isPending}
      className={className}
    >
      {request.isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <ShieldCheck className="h-4 w-4 mr-2" />
      )}
      {label}
      {gateEnabled ? null : (
        <span className="ml-2 text-[10px] opacity-60">(porte off)</span>
      )}
    </Button>
  );
}