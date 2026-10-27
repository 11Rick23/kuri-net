import type { notepads } from "@/database/schema";

export type Notepad = typeof notepads.$inferSelect;
