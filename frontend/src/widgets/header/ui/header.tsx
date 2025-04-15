import { ModeToggle } from "@/features/mode-toggle";

export const Header = () => {
  return (
    <header className="p-6 w-full flex justify-end items-end ">
      <ModeToggle />
    </header>
  );
};
