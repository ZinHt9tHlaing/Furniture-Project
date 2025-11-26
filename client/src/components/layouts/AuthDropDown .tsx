import { Form, Link } from "react-router";
import { User } from "@/types";

import { Button } from "../ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "../Icons";

interface UserProps {
  user: User;
}

const AuthDropDown = ({ user }: UserProps) => {
  if (!user) {
    return (
      <Button
        size="sm"
        className="cursor-pointer duration-200 active:scale-90"
        asChild
      >
        <Link to="/signin">
          Sign In
          <span className="sr-only">Sign In</span>
        </Link>
      </Button>
    );
  }

  // Generate initials from user's first and last name (fallback to "" if undefined).
  // Example: firstName = "John", lastName = "Doe" → initialName = "JD"
  const initialName = `${user.firstName.charAt(0) ?? ""}${user.lastName.charAt(0) ?? ""}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="size-8 cursor-pointer rounded-full"
        >
          <Avatar className="size-8">
            <AvatarImage src={user.imageUrl} alt={user.username ?? ""} />
            <AvatarFallback>{initialName}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-muted-foreground text-sm leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="group" asChild>
            <Link to="#">
              <Icons.dashboard
                className="mr-2 size-4 transition-all duration-300 ease-in-out group-hover:scale-110"
                aria-hidden="true"
              />
              Dashboard
              <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="group" asChild>
            <Link to="#">
              <Icons.gear
                className="mr-2 size-4 transition-all duration-300 ease-in-out group-hover:rotate-90"
                aria-hidden="true"
              />
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="group" asChild>
          {/* <Link to="/login" className="text-red-600">
            <Icons.exit
              className="mr-2 size-4 text-red-600 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-95"
              aria-hidden="true"
            />
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </Link> */}
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="w-full cursor-pointer font-semibold text-red-600 duration-200 active:scale-90"
            >
              Log out
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthDropDown;
