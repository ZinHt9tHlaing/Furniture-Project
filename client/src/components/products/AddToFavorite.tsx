import { cn } from "@/lib/utils";
import { Icons } from "../Icons";
import { Button } from "../ui/button";

interface FavoriteProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  productId: string;
  rating: number;
}

const AddToFavorite = ({
  productId,
  rating,
  className,
  ...props
}: FavoriteProps) => {
  return (
    <Button
      variant={"secondary"}
      size={"icon"}
      className={cn("size-8 shrink-0 cursor-pointer", className)}
      {...props}
    >
      <Icons.heart className="size-4" />
    </Button>
  );
};

export default AddToFavorite;
