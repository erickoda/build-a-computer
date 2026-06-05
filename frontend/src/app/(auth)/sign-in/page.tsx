'use client';

import { toast, Button, ErrorMessage, Input, Link } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import authApi from '@/src/services/endpoints/auth';
import { SignInRequestDto, TokenDto } from '@/src/services/endpoints/dtos';
import { ApiResult } from '@/src/services/api';

const signInSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z
    .string()
});

type SignInFormValues = z.infer<typeof signInSchema>;

const AuthPage = () => {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isLoading } } = useForm<SignInFormValues>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (data: SignInFormValues) => {
    const dto: SignInRequestDto = {
      email: data.email,
      password: data.password
    };

    const response: ApiResult<TokenDto> = await authApi.signIn(dto);

    if (!response.ok) {
      toast.danger("An error occurred while signing in", {
        description:
          response.error.message,
      });

      return;
    }

    const token = response.data.token;

    localStorage.setItem("token", token);

    router.push("/benchmarks");
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen p-4 bg-background">

      <div className="flex flex-col space-y-6 w-full max-w-sm p-8 border border-default-200 rounded-2xl shadow-xl bg-content1">

        <div className="flex flex-col space-y-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
          <p className="text-sm text-default-500">
            Enter your details to sign in to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 font-sans">
          <Input
            type="email"
            variant="primary"
            placeholder="you@example.com"
            {...register('email')}
          />

          <ErrorMessage>{errors.email && <>{errors.email.message}</>}</ErrorMessage>

          <div className="flex flex-col space-y-2">
            <Input
              type="password"
              variant="primary"
              placeholder="Enter your password"
              {...register('password')}
            />
            <ErrorMessage>{errors.password && <>{errors.password.message}</>}</ErrorMessage>
            <div className="flex justify-end w-full">
              <Link href="#" >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="outline" className="w-full font-medium" size="lg" >
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-default-500">
          Don't have an account?{' '}
          <Link onClick={() => router.push("/auth/sign-up")} className="font-semibold">
            Sign up
          </Link>
        </p>
      </div>

    </div>
  );
};

export default AuthPage;
