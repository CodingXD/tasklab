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
  getKeyValue,
  Link as NextLink,
  Pagination,
} from "@nextui-org/react";
import { type Key, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { status } from "../lib/constants/status";
import { useUserStore } from "../store/user";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../lib/utils/fetcher";

const filters = [{ label: "All", key: "all" }, ...status];

const columns = [
  {
    key: "title",
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
  todo: "default",
  inprogress: "warning",
  done: "success",
} as Record<string, string>;

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  creatorId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type Paginate = {
  limit: number;
  offset: number;
  total: number;
  data: Task[] | null;
};

export default function Home() {
  const user = useUserStore((state) => state.user);
  const [activeStatus, setActiveStatus] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const offset = rowsPerPage * (page - 1);
  const queryKey = `tasks-${page}-${rowsPerPage}-${offset}-${activeStatus}-${user?.id}`;
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn: () =>
      fetcher
        .get<Paginate>("/task/list", {
          params: {
            limit: rowsPerPage,
            offset,
            status: activeStatus,
            userId: user?.id,
          },
        })
        .then(({ data }) => data),
    enabled: !!user,
  });

  const renderCell = useCallback((task: Task, columnKey: Key) => {
    const cellValue = getKeyValue(task, columnKey);

    switch (columnKey) {
      case "title":
        return (
          <Link
            to={`new?id=${task.id}`}
            className="flex items-center text-bold text-sm hover:underline hover:underline-offset-2"
          >
            {cellValue}
          </Link>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[task.status as any] as any}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            {user?.role === "admin" || user?.id === task.creatorId ? (
              <Button isIconOnly color="danger" onPress={() => {}}>
                <TrashIcon className="size-4" />
              </Button>
            ) : null}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const pages = data?.total ? Math.ceil(data.total / rowsPerPage) : 0;

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

      <Table
        onSortChange={console.log}
        aria-label="List of todo's"
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={pages}
                onChange={setPage}
                classNames={{
                  item: "text-default-800",
                  next: "text-default-800",
                  prev: "text-default-800",
                }}
              />
            </div>
          ) : null
        }
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
          items={data?.data || []}
        >
          {(item) => (
            <TableRow key={item.id}>
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
