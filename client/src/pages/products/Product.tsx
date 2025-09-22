import ProductCard from "@/components/products/ProductCard";
import ProductFilter from "@/components/products/ProductFilter";
import PaginationBottom from "@/components/products/Pagination";
import { filterList, products } from "@/data/products";

const Product = () => {
  return (
    <div className="container mx-auto">
      <section className="flex flex-col lg:flex-row">
        <section className="my-8 ml-4 w-full lg:ml-0 lg:w-1/5">
          <ProductFilter
            title="Furniture Made By"
            filterList={filterList.categories}
          />
          <ProductFilter
            title="Furniture Types"
            filterList={filterList.types}
          />
        </section>
        <section className="w-full lg:ml-0 lg:w-4/5">
          <h1 className="my-8 ml-4 text-2xl font-bold">All Products</h1>
          <div className="mb-12 grid grid-cols-1 gap-6 gap-y-12 px-4 md:grid-cols-2 md:px-0 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <PaginationBottom />
        </section>
      </section>
    </div>
  );
};

export default Product;
