import { XCircleIcon } from "@heroicons/react/20/solid";

type Props = {
  text: string;
};

export default function Alert({ text }: Props) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="size-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{text}</p>
        </div>
      </div>
    </div>
  );
}
