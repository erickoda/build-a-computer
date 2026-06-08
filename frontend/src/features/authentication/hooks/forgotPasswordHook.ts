import { useState } from "react";
import { ForgotPasswordRequestDto, ResetPasswordRequestDto } from "../types/dtos";
import apiAuthentication from "../api/apiAuthentication";
import { HttpError } from "@/src/services/api";

const useForgotPassword = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const sendForgotPasswordRequest = async (dto: ForgotPasswordRequestDto): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiAuthentication.forgotPassword(dto);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return false;
    }

    return true;
  };

  const sendResetPasswordRequest = async (dto: ResetPasswordRequestDto): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiAuthentication.resetPassword(dto);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return false;
    }

    return true;
  };

  return {
    error,
    setError,
    isLoading,
    sendForgotPasswordRequest,
    sendResetPasswordRequest
  };
};

export default useForgotPassword;
