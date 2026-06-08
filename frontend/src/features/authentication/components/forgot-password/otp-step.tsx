import { useForm } from "react-hook-form";
import { OtpFormValues, otpSchema } from "../../schemas/forgotPassword";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ErrorMessage, Input, Label } from "@heroui/react";

function OtpStep({ onSubmitSuccess, onBack }: { onSubmitSuccess: (data: OtpFormValues) => void, onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmitSuccess)} className="flex flex-col space-y-4 w-full font-sans">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold text-white">Enter 6-digit OTP:</Label>
        <Input
          type="text"
          variant="primary"
          placeholder="000000"
          className="h-12 text-white text-center tracking-widest"
          {...register('otp')}
        />
        <ErrorMessage className="text-danger text-xs">{errors.otp && <>{errors.otp.message}</>}</ErrorMessage>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onPress={onBack}
          className="w-1/3 h-12 font-medium text-white border-default-200 rounded-full"
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="secondary"
          className="w-2/3 h-12 font-medium text-white border-default-200 hover:bg-default-100/20 rounded-full"
        >
          Verify
        </Button>
      </div>
    </form>
  );
}

export default OtpStep;
