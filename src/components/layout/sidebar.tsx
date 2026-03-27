import { getSession } from "@/lib/auth/session";
import { SidebarClient } from "./sidebar-client";

export async function Sidebar() {
  const session = await getSession();
  const role = session.role;
  const name = session.name ?? "User";

  return (
    <SidebarClient role={role} name={name} />
  );
}
