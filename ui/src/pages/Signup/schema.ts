import { email, minLength, object, string } from "valibot";

export const schema = object({
  firstName: string([minLength(1, "First name is required")]),
  lastName: string([minLength(1, "Last name is required")]),
  email: string([minLength(1, "Email is required"), email()]),
  password: string([minLength(8, "Must be at least 8 characters")]),
});
