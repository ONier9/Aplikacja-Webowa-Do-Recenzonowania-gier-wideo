import { User } from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
  user: any;
  username: string | null;
  onSignOut: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onCloseMenu?: () => void;
  isMobile?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  username,
  onSignOut,
  onOpenLogin,
  onOpenRegister,
  onCloseMenu,
  isMobile = false,
}) => {
  const handleAction = (action: () => void) => {
    action();
    onCloseMenu?.();
  };

  if (user) {
    return (
      <ul className={isMobile ? "space-y-3" : "flex items-center space-x-6"}>
        <li className="text-stone-300 hover:text-teal-300">
          <Link
            href={`/profile/${username}`}
            onClick={onCloseMenu}
            className="flex items-center"
          >
            <User className="h-4 w-4 mr-1" />
            My Profile
          </Link>
        </li>
        <li className="text-stone-300 hover:text-teal-300">
          <button onClick={() => handleAction(onSignOut)}>Sign Out</button>
        </li>
      </ul>
    );
  }

  return (
    <ul className={isMobile ? "space-y-3" : "flex items-center space-x-6"}>
      <li className="text-stone-300 hover:text-teal-300">
        <button onClick={() => handleAction(onOpenLogin)}>Log in</button>
      </li>
      <li className="text-stone-300 hover:text-teal-300">
        <button onClick={() => handleAction(onOpenRegister)}>Register</button>
      </li>
    </ul>
  );
};
