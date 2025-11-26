import api, { authApi } from "@/api";
import { redirect } from "react-router";

export const homeLoader = async () => {
  try {
    const res = await api.get("/users/infinite/products");
    return res.data;
  } catch (error) {
    console.log("HomeLoader error: ", error);
  }
};

export const loginLoader = async () => {
  try {
    const response = await authApi.get("/auth-check");
    if (response.status !== 200) {
      return null;
    }
    return redirect("/");
  } catch (error) {
    console.log("LoginLoader error: ", error);
  }
};
