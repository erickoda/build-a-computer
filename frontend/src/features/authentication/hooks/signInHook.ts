import { useState } from "react";
import { SignInRequestDto } from "../types/dtos";
import apiAuthentication from "../api/apiAuthentication";
import { HttpError } from "@/src/services/api";
import { setAuthCookie } from "@/src/actions/auth";

const useSignIn = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (dto: SignInRequestDto): Promise<{ ok: boolean; token?: string }> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiAuthentication.signIn(dto);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return { ok: false };
    }

    const token = result.data.token;
    await setAuthCookie(token);

    return { ok: true, token };
  };

  return {
    error,
    setError,
    isLoading,
    signIn
  };
};

export default useSignIn;
