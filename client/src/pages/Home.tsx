import { Button } from "@/components/ui/button";
import Couch from "../data/images/couch.png";
import { Link } from "react-router-dom";
import CarouselCard from "@/components/products/CarouselCard";
import { products } from "@/data/products";
import BlogCard from "@/components/blogs/BlogCard";
import { posts } from "@/data/posts";
import ProductCard from "@/components/products/ProductCard";

type TitleProps = {
  title: string;
  href?: string;
  sideText?: string;
};

const samplePosts = posts.slice(0, 3);

const Home = () => {
  // Reusable Component
  const Title = ({ title, href, sideText }: TitleProps) => (
    <div className="mt-28 mb-10 flex flex-col px-4 md:flex-row md:items-center md:justify-between md:px-0">
      <h2 className="mb-4 text-2xl font-bold md:mb-0">{title}</h2>
      <Link
        to={String(href)}
        className="text-muted-foreground font-semibold underline duration-200 md:active:scale-90"
      >
        {sideText}
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row lg:justify-between">
        {/* Text Section */}
        <div className="my-8 text-center lg:mt-16 lg:mb-0 lg:w-2/5 lg:text-left">
          <h1 className="text-own mb-4 text-4xl font-extrabold lg:mb-8 lg:text-6xl">
            Modern Interior Design Studio
          </h1>
          <p className="text-own mb-6 lg:mb-8">
            Furniture is an essential component of any living space, providing
            functionality, comfort, and aesthetic appeal.
          </p>
          <div>
            <Button
              asChild
              className="mr-2 rounded-full bg-orange-300 px-8 py-6 text-base font-bold duration-200 hover:bg-orange-400 active:scale-90"
            >
              <Link to="#">Shop Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-own rounded-full px-8 py-6 text-base font-bold duration-200 active:scale-90"
            >
              <Link to="#">Explore</Link>
            </Button>
          </div>
        </div>
        {/* Image Section */}
        <img src={Couch} alt="Couch" className="w-full lg:w-3/5" />
      </div>
      <CarouselCard products={products} />
      {/* Featured Products */}
      <Title
        title="Featured Products"
        href="/products"
        sideText="View All Products"
      />
      <ProductCard />

      {/* Recent Blog  */}
      <Title title="Recent Blog" href="/blogs" sideText="View All Posts" />
      <BlogCard posts={samplePosts} />
    </div>
  );
};

export default Home;
