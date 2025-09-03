import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layouts/Header";
import { Icons } from "@/components/Icons";
import Footer from "@/components/layouts/Footer";

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />
      <main className="mx-auto my-32 flex flex-1 items-center">
        <Card className="w-[350px] max-w-md rounded-2xl shadow-lg md:w-[500px] lg:w-[500px]">
          <CardHeader className="flex flex-col items-center">
            <Icons.exclamation
              className="mb-2 size-12 text-red-500"
              aria-hidden="true"
            />
            <CardTitle className="text-center text-2xl font-bold">
              Page Not Found
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-center text-gray-600">
              The page you’re looking for doesn’t exist or has been moved.
            </p>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button
              asChild
              className="rounded-xl bg-red-500 shadow-md duration-200 hover:bg-red-600 active:scale-90"
            >
              <Link to="/">Go Back Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
