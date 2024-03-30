import {
  any,
  array,
  minLength,
  number,
  object,
  optional,
  picklist,
  string,
  uuid,
} from "valibot";
import { status } from "../../lib/constants/status";

export const schema = object({
  id: optional(string([uuid("Invalid Task Id")])),
  title: string([minLength(1, "Title is required")]),
  description: optional(
    object({
      blocks: array(any()),
      version: string(),
      time: number(),
    })
  ),
  status: picklist(
    status.map(({ key }) => key),
    "Invalid Status"
  ),
  dueDate: optional(string()),
  collaborators: array(string([uuid()])),
});
