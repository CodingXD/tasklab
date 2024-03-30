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

type FormFields = Output<typeof schema>;

export default function Task() {
  let [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id") ?? undefined;
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
