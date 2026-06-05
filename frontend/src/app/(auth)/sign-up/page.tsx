'use client';

import { ApiResult } from '@/src/services/api';
import authApi from '@/src/services/endpoints/auth';
import {
  SignUpRequestDto,
  TokenDto,
} from '@/src/services/endpoints/dtos';
import {
  Button,
  ErrorMessage,
  Input,
  Label,
  Link,
  TextField,
  toast,
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Please enter a username'),
  email: z.email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must have at least 8 chars')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character',
    ),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AuthPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    const dto: SignUpRequestDto = {
      username: data.username,
      email: data.email,
      password: data.password,
    };

    const response: ApiResult<TokenDto> = await authApi.signUp(dto);

    if (!response.ok) {
      toast.danger('An error occurred while signing up', {
        description: response.error.message,
      });
      return;
    }

    const token = response.data.token;

    localStorage.setItem("token", token);

    router.push("/benchmarks");
  };

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen p-4 bg-background">
      <div className="flex flex-col space-y-6 w-full max-w-sm p-8 border border-default-200 rounded-2xl shadow-xl bg-content1">
        <div className="flex flex-col space-y-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome!</h1>
          <p className="text-sm text-default-500">
            Enter your details to register a new account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-2 font-sans"
        >
          <TextField>
            <Label className="text-xs font-bold tracking-wide">Username</Label>
            <Input
              variant="primary"
              placeholder="Cool Username"
              {...register('username')}
            />
          </TextField>

          <ErrorMessage>
            {errors.username && <>{errors.username.message}</>}
          </ErrorMessage>

          <TextField>
            <Label className="text-xs font-bold tracking-wide">Email</Label>
            <Input
              type="email"
              variant="primary"
              placeholder="you@example.com"
              {...register('email')}
            />
          </TextField>

          <ErrorMessage>
            {errors.email && <>{errors.email.message}</>}
          </ErrorMessage>

          <TextField>
            <Label className="text-xs font-bold tracking-wide">Password</Label>
            <Input
              type="password"
              variant="primary"
              placeholder="Enter your password"
              {...register('password')}
            />
          </TextField>

          <ErrorMessage>
            {errors.password && <>{errors.password.message}</>}
          </ErrorMessage>

          <Button
            type="submit"
            variant="outline"
            className="w-full font-medium"
            size="lg"
          >
            Sign Up
          </Button>
        </form>

        <p className="text-center text-sm text-default-500">
          Already have an account?{' '}
          <Link
            onClick={() => router.push('/auth/sign-in')}
            className="font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
