import {
  Avatar,
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { schema } from "./schema";
import type { Output } from "valibot";
import { status } from "../../lib/constants/status";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetcher } from "../../lib/utils/fetcher";
import { useUserStore } from "../../store/user";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

type FormFields = Output<typeof schema>;
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Task = {
  title: string;
  description?: any;
  status: string;
  dueDate?: string;
  collaborators: User[] | null;
};

export default function Task() {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id") ?? undefined;

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
    watch,
    setError,
  } = useForm<FormFields>({
    resolver: valibotResolver(schema),
    defaultValues: {
      id,
      collaborators: [],
      createdBy: user?.id,
    },
  });

  const [users, task] = useQueries({
    queries: [
      {
        queryKey: ["users"],
        queryFn: () =>
          fetcher.get<User[]>("/user/list").then(({ data }) => data),
      },
      {
        queryKey: [id],
        queryFn: () =>
          fetcher.get<Task>(`/task/${id}`).then(({ data }) => data),
        enabled: !!id,
      },
    ],
  });

  useEffect(() => {
    if (task.data) {
      setValue("title", task.data.title);
      if (task.data.description) {
        setValue("description", task.data.description);
      }
      if (task.data.dueDate) {
        setValue("dueDate", task.data.dueDate);
      }
      if (task.data.collaborators) {
        setValue(
          "collaborators",
          task.data.collaborators.map(({ id }) => id)
        );
      }
      setValue("status", task.data.status as any);
    }
  }, [task.data]);

  const addTask = useMutation({
    mutationFn: (data: FormFields) =>
      fetcher
        .post<string>("/task/create", data, { responseType: "text" })
        .then(({ data }) => data),
    onSuccess: (id) => {
      queryClient.clear();
      setSearchParams({ id });
    },
    onError: (error: any) =>
      setError("root", {
        message:
          error?.response?.data || error.message || "Something went wrong",
      }),
  });
  const editTask = useMutation({
    mutationFn: (data: FormFields) => fetcher.put("/task/edit", data),
    onSuccess: () => queryClient.clear(),
    onError: (error: any) =>
      setError("root", {
        message:
          error?.response?.data || error.message || "Something went wrong",
      }),
  });

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    if (data.id) {
      toast.promise(editTask.mutateAsync(data), {
        loading: "Saving...",
        success: `${data.title} has been updated`,
        error: "Failed to update task",
      });
    } else {
      toast.promise(addTask.mutateAsync(data), {
        loading: "Saving...",
        success: `${data.title} has been created`,
        error: "Failed to create task",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Button
        isIconOnly
        variant="light"
        onPress={() => navigate("/", { unstable_viewTransition: true })}
      >
        <ArrowLeftIcon className="size-4" />
      </Button>
      <h1 className="text-base font-semibold leading-7 text-gray-900">
        {id ? "Edit Task" : "Create Task"}
      </h1>
      <form
        method="POST"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            {...register("title")}
            value={watch("title")}
            label="Title"
            errorMessage={errors.title?.message}
          />
          <Select
            items={users.data?.filter(({ id }) => id !== user?.id) || []}
            label="Choose collaborators"
            isMultiline={true}
            selectionMode="multiple"
            selectedKeys={watch("collaborators")}
            onSelectionChange={(keys: any) =>
              setValue("collaborators", [...keys])
            }
            placeholder="Type to search..."
            labelPlacement="outside"
            classNames={{
              base: "max-w-xs",
              trigger: "min-h-unit-12 py-2",
            }}
            renderValue={(items) => {
              return (
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <Chip key={item.key}>
                      {item.data?.firstName} {item.data?.lastName}
                    </Chip>
                  ))}
                </div>
              );
            }}
          >
            {(user) => (
              <SelectItem key={user.id} textValue={user.id}>
                <div className="flex gap-2 items-center">
                  <Avatar
                    alt={`${user.firstName} ${user.lastName}`}
                    className="flex-shrink-0"
                    size="sm"
                  />
                  <div className="flex flex-col">
                    <span className="text-small">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-tiny text-default-400">
                      {user.email}
                    </span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>
        </div>
        <Textarea
          {...register("description")}
          label="Description"
          value={watch("description")}
          errorMessage={errors.description?.message}
        />

        <Select
          items={status}
          label="Status"
          className="max-w-xs"
          selectedKeys={[watch("status", "todo")]}
          disallowEmptySelection
          errorMessage={errors.status?.message}
          {...register("status")}
        >
          {(animal) => <SelectItem key={animal.key}>{animal.label}</SelectItem>}
        </Select>
        <Input
          {...register("dueDate")}
          value={watch("dueDate") as any}
          label="Due Date"
          type="date"
          className="lg:max-w-md"
          errorMessage={errors.dueDate?.message}
        />

        <br />
        <Button
          type="submit"
          color="success"
          fullWidth
          className="text-white"
          isLoading={addTask.isPending || editTask.isPending}
        >
          Save
        </Button>
      </form>
    </div>
  );
}
