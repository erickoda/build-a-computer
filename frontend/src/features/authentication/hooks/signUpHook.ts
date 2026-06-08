import { useState } from "react";
import { SignUpRequestDto } from "../types/dtos";
import apiAuthentication from "../api/apiAuthentication";
import { HttpError } from "@/src/services/api";

const useSignUp = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const signUp = async (dto: SignUpRequestDto): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiAuthentication.signUp(dto);

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
    signUp
  };
};

export default useSignUp;
