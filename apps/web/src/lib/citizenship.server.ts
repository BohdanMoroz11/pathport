import { cookies } from "next/headers";
import { CITIZENSHIP_COOKIE, DEFAULT_CITIZENSHIP_CODE } from "./citizenship";

/** Read the active citizenship code from the cookie (default USA). Server-only. */
export async function getActiveCitizenshipCode(): Promise<string> {
  const store = await cookies();
  return store.get(CITIZENSHIP_COOKIE)?.value ?? DEFAULT_CITIZENSHIP_CODE;
}
