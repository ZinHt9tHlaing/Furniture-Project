import { Link } from "react-router-dom";
import { Icons } from "../Icons";
import { siteConfig } from "@/config/site";

const Footer = () => {
  return (
    <footer className="w-full border-t">
      <div className="container mx-auto">
        <section className="flex flex-col gap-10 md:flex-row md:gap-20">
          <section className="">
            <Link to={"/"} className="flex items-center space-x-2">
              <Icons.logo className="size-6" aria-hidden="true" />
              <span className="font-bold">{siteConfig.name}</span>
              <span className="sr-only"></span>
            </Link>
          </section>
          <section className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-4">
            Loop Menu
          </section>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
