"use server";

import { cookies } from "next/headers";
import { deleteSession } from "./databaseFunctions";

export async function logout() {
	const cookieStore = await cookies();
	const sessionID = cookieStore.get("sessionID")?.value;
	cookieStore.delete("sessionID");

    await deleteSession(sessionID || "");
}
