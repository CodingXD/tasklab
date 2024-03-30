import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button, Input } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { schema } from "./schema";
import type { Output } from "valibot";
import { Link } from "react-router-dom";

type FormFields = Output<typeof schema>;

export default function Signup() {
  const {
    register,
    setError,
    formState: { errors, isSubmitting },
    setValue,
    handleSubmit,
  } = useForm<FormFields>({
    resolver: valibotResolver(schema),
  });

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Tasklab"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create an account
          </h2>{" "}
          <p className="mt-2 text-center text-sm text-gray-500">
            Already a member?{" "}
            <Link
              to="/login"
              unstable_viewTransition
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow-lg sm:rounded-lg sm:px-12">
            <form className="space-y-6" action="#" method="POST">
              <Input
                {...register("firstName")}
                label="First name"
                autoComplete="given-name"
                errorMessage={errors.firstName?.message}
              />
              <Input
                {...register("lastName")}
                label="Last name"
                autoComplete="family-name"
                errorMessage={errors.lastName?.message}
              />
              <Input
                type="email"
                {...register("email")}
                label="Email address"
                autoComplete="email"
                errorMessage={errors.email?.message}
              />
              <Input
                type="password"
                {...register("password")}
                label="Password"
                autoComplete="current-password"
                errorMessage={errors.password?.message}
              />

              <div>
                <Button
                  type="submit"
                  color="primary"
                  fullWidth
                  isLoading={isSubmitting}
                  className="mt-6"
                >
                  Sign in
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
