import MainNavigation from "./MainNavigation";
import MobileNavigation from "./MobileNavigation";

const Header = () => {
  return (
    <header className="w-full border-b">
      <nav className="container flex items-center h-16 mx-auto">
        <MainNavigation />
        <MobileNavigation />
      </nav>
    </header>
  );
};

export default Header;
