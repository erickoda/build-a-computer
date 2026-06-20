'use client';

import { getRoleFromToken } from '@/src/utils/jwt';
import { roleDefaultRedirect } from '@/src/utils/redirect';
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
import useSignUp from '../../hooks/signUpHook';
import { LoginFormValues, loginSchema } from '../../schemas/signUp';
import { SignUpRequestDto } from '../../types/dtos';

const SignUpPage = () => {
  const router = useRouter();
  const { signUp, isLoading, error } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    const dto: SignUpRequestDto = {
      username: data.username,
      email: data.email,
      password: data.password,
    };

    const { ok, token } = await signUp(dto);

    if (ok && token) {
      toast.success('Account created successfully!');

      const role = getRoleFromToken(token);

      router.push(role ? roleDefaultRedirect[role] : '/');
    } else {
      toast.danger('An error occurred while signing up', {
        description:
          error?.message || 'Please check your details and try again.',
      });
    }
  };

  const isBusy = isLoading || isSubmitting;

  return (
    <>
      <div className="flex flex-col space-y-1 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome!</h1>
        <p className="text-sm text-default-500">
          Enter your details to register a new account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4 font-sans"
      >
        <div className="flex flex-col space-y-1">
          <TextField>
            <Label className="text-xs font-bold tracking-wide">Username</Label>
            <Input
              variant="primary"
              placeholder="Cool Username"
              disabled={isBusy}
              {...register('username')}
            />
          </TextField>
          <ErrorMessage className="text-xs text-danger">
            {errors.username && <>{errors.username.message}</>}
          </ErrorMessage>
        </div>

        <div className="flex flex-col space-y-1">
          <TextField>
            <Label className="text-xs font-bold tracking-wide">Email</Label>
            <Input
              type="email"
              variant="primary"
              placeholder="you@example.com"
              disabled={isBusy}
              {...register('email')}
            />
          </TextField>
          <ErrorMessage className="text-xs text-danger">
            {errors.email && <>{errors.email.message}</>}
          </ErrorMessage>
        </div>

        <div className="flex flex-col space-y-1">
          <TextField>
            <Label className="text-xs font-bold tracking-wide">Password</Label>
            <Input
              type="password"
              variant="primary"
              placeholder="Enter your password"
              disabled={isBusy}
              {...register('password')}
            />
          </TextField>
          <ErrorMessage className="text-xs text-danger">
            {errors.password && <>{errors.password.message}</>}
          </ErrorMessage>
        </div>

        <Button
          type="submit"
          variant="outline"
          className="w-full font-medium mt-2"
          size="lg"
          isDisabled={isBusy}
        >
          {isBusy ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </form>

      <p className="text-center text-sm text-default-500">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-semibold cursor-pointer">
          Sign in
        </Link>
      </p>
    </>
  );
};

export default SignUpPage;
