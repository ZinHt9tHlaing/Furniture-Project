import { Link } from "react-router-dom";
import { Icons } from "../Icons";
import { siteConfig } from "@/config/site";
import NewLetterForm from "../new-letter";

const Footer = () => {
  return (
    <footer className="ml-4 w-full border-t lg:ml-0 md:px-0 lg:px-20">
      <div className="container mx-auto pt-6 pb-8 lg:py-6">
        <section className="flex flex-col gap-10 lg:flex-row lg:gap-20 lg:justify-between">
          <section className="">
            <Link to={"/"} className="flex items-center space-x-2">
              <Icons.logo className="size-6" aria-hidden="true" />
              <span className="font-bold">{siteConfig.name}</span>
              <span className="sr-only"></span>
            </Link>
          </section>
          <section className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-4">
            {siteConfig.footerNav.map((foot, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-semibold">{foot.title}</h4>
                <ul className="">
                  {foot.items.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        target={item.external ? "_blank" : "_self"}
                        className="text-muted-foreground hover:text-foreground text-sm hover:font-medium"
                      >
                        {item.title}
                        <span className="sr-only">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
          <section className="space-y-3">
            <h4 className="font-medium">Subscribe to our newsLetter</h4>
            <NewLetterForm />
          </section>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
