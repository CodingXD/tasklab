import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useSearchParams } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { schema } from "./schema";
import type { Output } from "valibot";
import RichText from "../../components/RichText";
import { status } from "../../lib/constants/status";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetcher } from "../../lib/utils/fetcher";

type FormFields = Output<typeof schema>;
type SearchResult = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function Task() {
  let [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
  const [searchTerm, setSearchTerm] = useState("");
  const {
    register,
    setError,
    formState: { errors, isSubmitting },
    setValue,
    handleSubmit,
    watch,
  } = useForm<FormFields>({
    resolver: valibotResolver(schema),
    defaultValues: {
      id,
    },
  });
  const [users, task] = useQueries({
    queries: [
      {
        queryKey: [`users-${searchTerm}`],
        queryFn: () =>
          fetcher
            .get("/user/find", { params: { q: searchTerm } })
            .then(({ data }) => data),
        enabled: !!searchTerm,
      },
      {
        queryKey: [id],
        queryFn: () =>
          fetcher
            .get("/task/find", { params: { q: searchTerm } })
            .then(({ data }) => data),
        enabled: !!searchTerm,
      },
    ],
  });
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn: () =>
      fetcher
        .get<SearchResult[]>("/task/list", {
          params: { limit: rowsPerPage, offset, status: activeStatus },
        })
        .then(({ data }) => data),
    enabled: !!user,
  });

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    console.log(data);
  };

  return (
    <div className="space-y-6">
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
          <Autocomplete
            className="max-w-xs"
            inputValue={list.filterText}
            isLoading={list.isLoading}
            items={list.items}
            label="Select a character"
            placeholder="Type to search..."
            variant="bordered"
            onInputChange={list.setFilterText}
          >
            {(item) => (
              <AutocompleteItem key={item.name} className="capitalize">
                {item.name}
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>
        <RichText
          data={watch("description") as any}
          onChange={(api) =>
            api.saver
              .save()
              .then((data) => setValue("description", data as any))
          }
        />
        <Select
          items={status}
          label="Status"
          className="max-w-xs"
          defaultSelectedKeys={["todo"]}
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
          isLoading={isSubmitting}
        >
          Save
        </Button>
      </form>
    </div>
  );
}
