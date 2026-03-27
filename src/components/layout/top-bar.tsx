import { getSession } from "@/lib/auth/session";
import { TopBarClient } from "./top-bar-client";

export async function TopBar() {
  const session = await getSession();
  const name = session.name ?? "Customer";

  return <TopBarClient name={name} />;
}
