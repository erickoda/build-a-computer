'use client';

import { toast, Button, ErrorMessage, Input, Link } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { SignInFormValues, signInSchema } from '../../schemas/signIn';
import { SignInRequestDto } from '../../types/dtos';
import useSignIn from '../../hooks/signInHook';

const SignInPage = () => {
  const router = useRouter();
  const { error, isLoading, signIn } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema)
  });

  const onSubmit = async (data: SignInFormValues) => {
    const dto: SignInRequestDto = {
      email: data.email,
      password: data.password
    };

    const isSuccess: boolean = await signIn(dto);

    if (isSuccess) {
      toast.success("Signed in successfully!");
      router.push("/benchmarks");
    } else {
      toast.danger("An error occurred while signing in", {
        description: error?.message || "Please check your credentials and try again.",
      });
    }
  };

  const isBusy = isLoading || isSubmitting;

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

          <div className="flex flex-col space-y-1">
            <Input
              type="email"
              variant="primary"
              placeholder="you@example.com"
              disabled={isBusy}
              {...register('email')}
            />
            <ErrorMessage className="text-xs text-danger">
              {errors.email && <>{errors.email.message}</>}
            </ErrorMessage>
          </div>

          <div className="flex flex-col space-y-1">
            <Input
              type="password"
              variant="primary"
              placeholder="Enter your password"
              disabled={isBusy}
              {...register('password')}
            />
            <ErrorMessage className="text-xs text-danger">
              {errors.password && <>{errors.password.message}</>}
            </ErrorMessage>

            <div className="flex justify-end w-full pt-1">
              <Link href="/forgot-password" className="font-medium hover:opacity-80">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="outline"
            className="w-full font-medium mt-2"
            size="lg"
            isDisabled={isBusy}
          >
            {isBusy ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-default-500">
          Don't have an account?{' '}
          <Link href="/sign-up" className="font-semibold cursor-pointer">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default SignInPage;
