import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Separator } from "../ui/separator";
import { cartItems } from "@/data/carts";
import { Link } from "react-router-dom";
import { ScrollArea } from "../ui/scroll-area";
import CartItem from "../cart/CartItem";
import { formatPrice } from "@/lib/utils";

export default function CartSheet() {
  const itemCount = 4;
  const amountTotal = 190;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="relative cursor-pointer"
          aria-label="Open cart"
        >
          <Badge
            variant={"destructive"}
            className="absolute -top-2 -right-2 size-4 justify-center rounded-full p-2.5"
          >
            {itemCount}
          </Badge>
          <ShoppingCart className="size-4" aria-hidden="true" />
          <span className="sr-only">Cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full text-center text-2xl md:max-w-lg">
        <SheetHeader>
          <SheetTitle>Cart - {itemCount}</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="h-[68vh] pb-8">
              <div className="flex-1">
                {cartItems.map((cart) => (
                  <CartItem key={cart.id} cart={cart} />
                ))}
              </div>
            </ScrollArea>
            <div className="space-y-4 mx-5">
              <Separator />
              <div className="mx-4 space-y-1.5 text-base">
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>{formatPrice(amountTotal.toFixed(2))}</span>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button
                    type="submit"
                    asChild
                    className="w-full duration-200 active:scale-95"
                  >
                    <Link to="/checkout" aria-label="Check out">
                      Continue to checkout
                    </Link>
                  </Button>
                </SheetClose>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-1">
            <ShoppingCart className="text-muted-foreground mb-4 size-16" />
            <h3 className="text-muted-foreground text-xl font-medium">
              Your cart is empty
            </h3>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
