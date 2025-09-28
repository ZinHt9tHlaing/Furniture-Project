import { formatPrice } from "@/lib/utils";
import { Cart } from "@/types";
import { Separator } from "../ui/separator";
import Editable from "./Editable";

interface CartProps {
  cart: Cart;
}

const CartItem = ({ cart }: CartProps) => {
  return (
    <div className="mx-9 space-y-3">
      <div className="mt-4 mb-2 flex gap-4">
        <img
          src={String(cart.image.url)}
          alt={cart.name}
          className="w-16 object-cover"
        />
        <div className="flex flex-col space-y-1">
          <span className="line-clamp-1 text-start text-sm font-medium">
            {cart.name}
          </span>
          <span className="text-muted-foreground text-start text-xs">
            {formatPrice(cart.price)} x {cart.quantity} ={" "}
            {formatPrice((cart.price * cart.quantity).toFixed(2))}
          </span>
          <span className="text-muted-foreground line-clamp-1 text-xs capitalize">
            {`${cart.category} / ${cart.subcategory}`}
          </span>
        </div>
      </div>
      <Editable />
      <Separator />
    </div>
  );
};

export default CartItem;
