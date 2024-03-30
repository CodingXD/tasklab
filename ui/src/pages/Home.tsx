import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Button,
  ButtonGroup,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  getKeyValue,
  Link as NextLink,
} from "@nextui-org/react";
import { type Key, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { status } from "../lib/constants/status";
import { useUserStore } from "../store/user";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../lib/utils/fetcher";

const filters = [{ label: "All", key: "all" }, ...status];

const rows = [
  {
    key: "1",
    todo: "Tony Reichert",
    creator: "CEO",
    status: "Active",
  },
  {
    key: "2",
    todo: "Zoey Lang",
    creator: "Technical Lead",
    status: "Paused",
  },
  {
    key: "3",
    todo: "Jane Fisher",
    creator: "Senior Developer",
    status: "Active",
  },
  {
    key: "4",
    todo: "William Howard",
    creator: "Community Manager",
    status: "Vacation",
  },
];

const columns = [
  {
    key: "todo",
    label: "TODO",
  },
  {
    key: "status",
    label: "STATUS",
  },
  {
    key: "actions",
    label: "",
  },
];

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

export default function Home() {
  const user = useUserStore((state) => state.user);
  const [activeStatus, setActiveStatus] = useState("all");
  const [selectedTasks, setSelectedTasks] = useState(new Set([]));
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const queryKey = ``;
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn: () =>
      fetcher
        .get("/task/list", { params: { limit, offset, status: activeStatus } })
        .then(({ data }) => data),
    enabled: !!user,
  });

  const renderCell = useCallback(
    (task: (typeof rows)[number], columnKey: Key) => {
      const cellValue = getKeyValue(task, columnKey);

      switch (columnKey) {
        case "todo":
          return (
            <Link
              to={`new?id=${task.key}`}
              className="flex items-center text-bold text-sm hover:underline hover:underline-offset-2"
            >
              {cellValue}
            </Link>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[cellValue]}
              size="sm"
              variant="flat"
            >
              {cellValue}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              {["member", "admin"].includes(user?.role ?? "member") ? (
                <Tooltip color="danger" content="Delete task">
                  <span className="text-lg text-danger cursor-pointer active:opacity-50">
                    <TrashIcon
                      className="size-4"
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        onOpen();
                      }}
                    />
                  </span>
                </Tooltip>
              ) : null}
            </div>
          );
        default:
          return cellValue;
      }
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <ButtonGroup>
          {filters.map(({ key, label }) => (
            <Button
              key={key}
              onPress={() => setActiveStatus(key)}
              color={activeStatus === key ? "primary" : "default"}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
        <Button
          variant="solid"
          size="sm"
          as={NextLink}
          href="new"
          startContent={<PlusIcon className="size-3" />}
        >
          New
        </Button>
      </div>

      {[...selectedTasks].length > 0 && (
        <div className="flex space-x-2">
          <Button color="secondary" variant="flat" size="sm">
            Mark as Done
          </Button>
          <Button color="danger" variant="flat" size="sm" isIconOnly>
            <TrashIcon className="size-3.5" />
          </Button>
        </div>
      )}

      <Table
        selectionMode="multiple"
        onSortChange={console.log}
        onSelectionChange={setSelectedTasks}
        selectedKeys={selectedTasks}
        aria-label="List of todo's"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} allowsSorting>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          loadingContent={<Spinner />}
          loadingState={isLoading ? "loading" : "idle"}
          emptyContent={
            isLoading ? (
              <small>Fetching tasks...</small>
            ) : error ? (
              <small className="text-danger-500">Failed to load tasks</small>
            ) : (
              <small>No tasks to show.</small>
            )
          }
          items={rows}
        >
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
