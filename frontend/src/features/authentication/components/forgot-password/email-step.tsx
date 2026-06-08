import { Button, ErrorMessage, Input, Label } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmailFormValues, emailSchema } from "../../schemas/forgotPassword";
import { useForm } from "react-hook-form";

function EmailStep({ onSubmitSuccess, isLoading }: { onSubmitSuccess: (data: EmailFormValues) => void, isLoading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmitSuccess)} className="flex flex-col space-y-4 w-full font-sans">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold text-white">Enter your email:</Label>
        <Input
          type="email"
          variant="primary"
          placeholder="you@example.com"
          className="h-12 text-white"
          {...register('email')}
        />
        <ErrorMessage className="text-danger text-xs">{errors.email && <>{errors.email.message}</>}</ErrorMessage>
      </div>

      <Button
        type="submit"
        variant="outline"
        isDisabled={isLoading}
        className="w-full h-12 font-medium text-white border-default-200 hover:bg-default-100/20 rounded-full"
      >
        {isLoading ? "Sending..." : "Send OTP"}
      </Button>
    </form>
  );
}

export default EmailStep;
