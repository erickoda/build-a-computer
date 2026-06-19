import { useCallback, useState } from "react";
import { ApiResult, HttpError } from "@/src/services/api";
import apiUsers from "../api/apiUsers";
import { UserResponseDto } from "../types/dtos";

const useFetchUsers = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async (): Promise<ApiResult<UserResponseDto[]>> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiUsers.getUsers();

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      setUsers(result.data);
    }

    return result;
  }, []);

  return {
    error,
    setError,
    isLoading,
    users,
    fetchUsers
  };
};

export default useFetchUsers;
