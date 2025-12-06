import { useSearchParams } from "react-router";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";

import ProductCard from "@/components/products/ProductCard";
import ProductFilter from "@/components/products/ProductFilter";
import { categoryTypeQuery, productInfiniteQuery } from "@/api/query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Product = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawCategory = searchParams.get("categories"); // encoded "1,2"
  const rawType = searchParams.get("types"); // encoded "1,3"

  // Decode, parse search params and validation
  const selectedCategory = rawCategory
    ? decodeURIComponent(rawCategory)
        .split(",")
        .map((cat) => Number(cat.trim())) // convert string to number and remove whitespace
        .filter((cat) => !isNaN(cat)) // remove not a number
        .map((cat) => cat.toString())
    : []; // decoded "1,2 a b" ==> ["1", "2"]

  const selectedType = rawType
    ? decodeURIComponent(rawType)
        .split(",")
        .map((type) => Number(type.trim()))
        .filter((type) => !isNaN(type))
        .map((type) => type.toString())
    : [];

  const cat = selectedCategory.length > 0 ? selectedCategory.join(",") : null; // array to string

  const type = selectedType.length > 0 ? selectedType.join(",") : null;

  const { data: cateTypeData } = useSuspenseQuery(categoryTypeQuery());
  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    // isFetchingPreviousPage,
    fetchNextPage,
    // fetchPreviousPage,
    hasNextPage,
    // hasPreviousPage,
  } = useInfiniteQuery(productInfiniteQuery(cat, type));

  const allProducts = data?.pages.flatMap((page) => page.products) ?? [];

  if (status === "pending") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <section className="flex flex-col lg:flex-row">
        <section className="my-8 ml-4 w-full lg:ml-0 lg:w-1/5">
          <ProductFilter filterList={cateTypeData} />
        </section>
        <section className="w-full lg:ml-0 lg:w-4/5">
          <h1 className="my-8 ml-4 text-2xl font-bold">All Products</h1>
          <div className="mb-12 grid grid-cols-1 gap-6 gap-y-12 px-4 md:grid-cols-2 md:px-0 lg:grid-cols-3">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* <PaginationBottom /> */}

          <div className="my-4 flex justify-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              variant={!hasNextPage ? "ghost" : "secondary"}
              className="cursor-pointer rounded-md px-6 py-2 text-lg shadow-sm duration-200 active:scale-90 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading more...
                </div>
              ) : hasNextPage ? (
                "Load More"
              ) : (
                "Nothing more to load"
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            {isFetching && !isFetchingNextPage
              ? "Background Updating..."
              : null}
          </div>
        </section>
      </section>
    </div>
  );
};

export default Product;
