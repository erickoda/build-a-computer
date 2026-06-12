import { useState } from "react";
import { HttpError } from "@/src/services/api";
import apiUsers from "../api/apiUsers";

const useDeleteUser = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const deleteUserRequest = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiUsers.deleteUser(id);

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
    deleteUserRequest
  };
};

export default useDeleteUser;
