import api from "@/api";

export const homeLoader = async () => {
  try {
    const res = await api.get("/users/infinite/products");
    return res.data;
  } catch (error) {
    console.log("HomeLoader error: ", error);
  }
};
