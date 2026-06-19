"use client";

import ForgotPasswordSteps from "./forgot-password-steps";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

const ForgotPasswordPage = () => {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col space-y-1 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-default-500">
          Enter your details to reset your account password.
        </p>
      </div>

      <ForgotPasswordSteps />

      <div className="flex flex-row space-x-2">
        <Button onClick={() => { router.push("/sign-up") }} variant="outline">
          <p className="text-center text-sm text-default-500">
            Sign up
          </p>
        </Button>

        <Button onClick={() => { router.push("/sign-in") }} variant="outline">
          <p className="text-center text-sm text-default-500">
            Sign in
          </p>
        </Button>
      </div>
    </>
  )
}

export default ForgotPasswordPage
