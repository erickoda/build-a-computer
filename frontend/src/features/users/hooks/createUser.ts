import { useState } from "react";
import { HttpError } from "@/src/services/api";
import apiUsers from "../api/apiUsers";
import { CreateUserRequestDto } from "../types/dtos";

const useCreateUser = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const createUserRequest = async (dto: CreateUserRequestDto): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiUsers.createUser(dto);

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
    createUserRequest
  };
};

export default useCreateUser;
