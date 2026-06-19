import { useState } from "react";
import { HttpError } from "@/src/services/api";
import apiUsers from "../api/apiUsers";
import { UpdateUserRequestDto } from "../types/dtos";

const useUpdateUser = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const updateUserRequest = async (id: string, dto: UpdateUserRequestDto): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiUsers.updateUser(id, dto);

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
    updateUserRequest
  };
};

export default useUpdateUser;
