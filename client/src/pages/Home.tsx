import { Button } from "@/components/ui/button";
import Couch from "../data/images/couch.png";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center lg:flex-row lg:justify-between">
        {/* Text Section */}
        <div className="text-center lg:text-left">
          <h1 className="text-own mb-4 text-4xl font-extrabold lg:mb-8 lg:text-6xl">
            Modern Interior Design Studio
          </h1>
          <p>
            Furniture is an essential component of any living space, providing
            functionality, comfort, and aesthetic appeal.
          </p>
          <div>
            <Button asChild className="duration-200 active:scale-90">
              <Link to="#">Shop Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="duration-200 active:scale-90"
            >
              <Link to="#">Explore</Link>
            </Button>
          </div>
        </div>
        {/* Image Section */}
        <img src={Couch} alt="Couch" className="" />
      </div>
    </div>
  );
};

export default Home;
