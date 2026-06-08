"use client";

import ForgotPasswordSteps from "./forgot-password-steps";

const ForgotPasswordPage = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen p-4 bg-background">

      <div className="flex flex-col space-y-6 w-fit p-8 border border-default-200 rounded-2xl shadow-xl bg-content1">

        <div className="flex flex-col space-y-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Forgot your password?</h1>
          <p className="text-sm text-default-500">
            Enter your details to reset your account password.
          </p>
        </div>

        <ForgotPasswordSteps />
      </div>
    </div>
  )
}

export default ForgotPasswordPage
