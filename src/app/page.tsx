import { ScriptForm } from "@/components/script-form";
import { UserChat } from "@/components/user-chat";

export default function Page() {
  return (
    <main className="auto-rows-min grid grid-cols-1 w-full">
      <UserChat />
      <ScriptForm />
    </main>
  );
}
