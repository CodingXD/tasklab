import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button, Input } from "@nextui-org/react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { schema } from "./schema";
import type { Output } from "valibot";
import { Link, useNavigate } from "react-router-dom";
import { fetcher } from "../../lib/utils/fetcher";
import { useUserStore } from "../../store/user";
import Alert from "../../components/Alert";

type FormFields = Output<typeof schema>;

export default function Login() {
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const {
    register,
    setError,
    formState: { errors, isSubmitting },
    handleSubmit,
    watch,
  } = useForm<FormFields>({
    resolver: valibotResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const { data } = await fetcher.post("/auth/login", values);
      setUser(data);
      navigate("/", { unstable_viewTransition: true });
    } catch (error: any) {
      console.log(error);
      setError("root", {
        message:
          error?.response?.data || error?.message || "Something went wrong",
      });
    }
  };

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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Not a member?{" "}
            <Link
              to="/signup"
              unstable_viewTransition
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Create an account now
            </Link>
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow-lg sm:rounded-lg sm:px-12">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              method="POST"
            >
              {errors.root?.message && <Alert text={errors.root.message} />}
              <Input
                type="email"
                {...register("email")}
                label="Email address"
                autoComplete="email"
                errorMessage={errors.email?.message}
                value={watch("email")}
              />
              <Input
                type="password"
                {...register("password")}
                label="Password"
                autoComplete="current-password"
                errorMessage={errors.password?.message}
                value={watch("password")}
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
