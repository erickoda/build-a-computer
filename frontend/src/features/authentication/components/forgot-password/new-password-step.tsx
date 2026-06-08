import { useForm } from "react-hook-form";
import { NewPasswordFormValues, newPasswordSchema } from "../../schemas/forgotPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ErrorMessage, Input, Label } from "@heroui/react";

function NewPasswordStep({ onSubmitSuccess, onBack, isLoading }: {
  onSubmitSuccess: (data: NewPasswordFormValues) => void, onBack: () => void, isLoading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmitSuccess)} className="flex flex-col space-y-4 w-full font-sans">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold text-white">New password:</Label>
        <Input
          type="password"
          variant="primary"
          placeholder="Enter new password"
          className="h-12 text-white"
          {...register('newPassword')}
        />
        <ErrorMessage className="text-danger text-xs">{errors.newPassword && <>{errors.newPassword.message}</>}</ErrorMessage>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold text-white">Confirm new password:</Label>
        <Input
          type="password"
          variant="primary"
          placeholder="Confirm new password"
          className="h-12 text-white"
          {...register('confirmPassword')}
        />
        <ErrorMessage className="text-danger text-xs">{errors.confirmPassword && <>{errors.confirmPassword.message}</>}</ErrorMessage>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onPress={onBack}
          isDisabled={isLoading}
          className="w-1/3 h-12 font-medium text-white border-default-200 rounded-full"
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="secondary"
          isDisabled={isLoading}
          className="w-2/3 h-12 font-medium text-white border-default-200 hover:bg-default-100/20 rounded-full"
        >
          {isLoading ? "Resetting..." : "Reset"}
        </Button>
      </div>
    </form>
  );
}

export default NewPasswordStep;
