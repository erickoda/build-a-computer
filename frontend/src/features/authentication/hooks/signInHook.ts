import { useState } from "react";
import { SignInRequestDto } from "../types/dtos";
import apiAuthentication from "../api/apiAuthentication";
import { HttpError } from "@/src/services/api";

const useSignIn = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (dto: SignInRequestDto): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiAuthentication.signIn(dto);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return false;
    }

    const token = result.data.token;

    localStorage.setItem("token", token);

    return true;
  };

  return {
    error,
    setError,
    isLoading,
    signIn
  };
};

export default useSignIn;
