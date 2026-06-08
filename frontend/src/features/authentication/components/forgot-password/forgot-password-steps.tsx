"use client";

import { useState } from "react";
import { toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Steps } from "@/src/components/steps";
import useForgotPassword from "@/src/features/authentication/hooks/forgotPasswordHook";
import { EmailFormValues, NewPasswordFormValues, OtpFormValues } from "../../schemas/forgotPassword";
import EmailStep from "./email-step";
import OtpStep from "./otp-step";
import NewPasswordStep from "./new-password-step";


export default function ForgotPasswordSteps() {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const {
    sendForgotPasswordRequest,
    sendResetPasswordRequest,
    isLoading
  } = useForgotPassword();

  const handleEmailSubmit = async (data: EmailFormValues) => {
    const isSuccess = await sendForgotPasswordRequest({ email: data.email });

    if (isSuccess) {
      setEmail(data.email);
      toast.success("OTP sent to your email!");

      setTimeout(() => {
        setStep(1);
      }, 100);
    } else {
      toast.danger("Failed to send OTP", {
        description: "Please check the email provided and try again."
      });
    }
  };

  const handleOtpSubmit = (data: OtpFormValues) => {
    setOtp(data.otp);
    setStep(2);
  };

  const handlePasswordSubmit = async (data: NewPasswordFormValues) => {
    const isSuccess = await sendResetPasswordRequest({
      email,
      otp,
      newPassword: data.newPassword,
    });

    if (isSuccess) {
      toast.success("Password reset successfully!");
      router.push("/sign-in");
    } else {
      toast.danger("Failed to reset password", {
        description: "The OTP might be invalid or expired. Please try again."
      });
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto flex flex-col items-center">

      <div className="w-full mb-10">
        {step === 0 && <EmailStep onSubmitSuccess={handleEmailSubmit} isLoading={isLoading} />}
        {step === 1 && <OtpStep onSubmitSuccess={handleOtpSubmit} onBack={() => setStep(0)} />}
        {step === 2 && <NewPasswordStep onSubmitSuccess={handlePasswordSubmit} onBack={() => setStep(1)} isLoading={isLoading} />}
      </div>

      <div className="w-full">
        <Steps
          steps={[
            { title: 'Email' },
            { title: 'OTP' },
            { title: 'New Password' }
          ]}
          currentStep={step}
        />
      </div>

    </div>
  );
}

