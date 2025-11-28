import { Product } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router";
import { Icons } from "../Icons";
import { cn, formatPrice } from "@/lib/utils";

interface ProductProps extends React.HTMLAttributes<HTMLDivElement> {
  product: Product;
}

const imageUrl = import.meta.env.VITE_IMG_URL;

const ProductCard = ({ product, className }: ProductProps) => {
  return (
    <Card className={cn("size-full overflow-hidden rounded-lg", className)}>
      <Link to={`/products/${product.id}`} aria-label={product.name}>
        <CardHeader className="gap-0 border-b p-0">
          <AspectRatio ratio={1 / 1} className="bg-muted">
            <img
              src={imageUrl + product.images[0].path}
              alt="product image"
              loading="lazy"
              decoding="async"
              className="size-full object-contain transition-all duration-500 ease-in-out lg:hover:scale-105"
            />
          </AspectRatio>
        </CardHeader>
      </Link>

      <CardContent className="space-y-1.5 p-4">
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-1">
          {formatPrice(product.price)}
          {product.discount > 0 && (
            <span className="ml-2 font-light line-through">
              {formatPrice(product.discount)}
            </span>
          )}
        </CardDescription>
      </CardContent>

      <CardFooter className="p-4 pt-1">
        {product.status === "sold" ? (
          <Button
            size={"sm"}
            className="h-8 w-full cursor-not-allowed rounded-sm font-bold"
            disabled={true}
            aria-label="Sold Out"
          >
            Sold Out
          </Button>
        ) : (
          <Button
            aria-label="Add to cart"
            size={"sm"}
            className="bg-own h-8 w-full cursor-pointer rounded-sm text-center font-bold duration-200 hover:bg-emerald-900 active:scale-95 dark:text-white"
          >
            <Icons.plus className="mr-2" /> Add to cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
