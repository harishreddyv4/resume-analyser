import { SUPABASE_SETUP_REQUIRED_MESSAGE } from "./config-messages";

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(SUPABASE_SETUP_REQUIRED_MESSAGE);
    this.name = "SupabaseNotConfiguredError";
  }
}
