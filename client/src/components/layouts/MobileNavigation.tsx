import { MainNavItem } from "@/types";
import { Icons } from "../Icons";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  // SheetDescription,
  // SheetFooter,
  // SheetHeader,
  // SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";

interface MainNavigationProps {
  items?: MainNavItem[];
}

const MobileNavigation = ({ items }: MainNavigationProps) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  const query = "(min-width: 1024px)";

  // check if the screen size is larger than 1024px
  useEffect(() => {
    const onChangeHandler = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    const result = matchMedia(query);
    result.addEventListener("change", onChangeHandler);
    // clean up the event listener
    return () => result.removeEventListener("change", onChangeHandler);
  }, [query]);

  if (isDesktop) return null;

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size={"icon"}
            className="ml-4 size-5 cursor-pointer duration-200 active:scale-90"
          >
            <Icons.menu aria-hidden="true" />
            {/* sr => screen reader */}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[70%] pt-9 pl-7">
          <SheetClose asChild>
            <Link to={"/"} className="flex items-center">
              <Icons.logo className="mr-2 size-5" aria-hidden="true" />
              <span className="text-lg font-bold">{siteConfig.name}</span>
              {/* sr => screen reader */}
              <span className="sr-only">Home</span>
            </Link>
          </SheetClose>
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-8">
            <Accordion type="multiple" className="w-[80%] border-b-2">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-md">
                  {items?.[0].title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2 pl-2">
                    {items?.[0].card?.map((item, index) => (
                      <SheetClose asChild key={index}>
                        <Link
                          to={String(item.href)}
                          className="text-foreground/70"
                        >
                          {item.title}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-4 flex flex-col space-y-2">
              {items?.[0].menu?.map((item, index) => (
                <SheetClose asChild key={index}>
                  <Link to={String(item.href)} className="font-semibold">
                    {item.title}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
