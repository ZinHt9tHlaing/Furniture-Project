import api, { authApi } from "@/api";
import useAuthStore, { Status } from "@/store/auth/authStore";
import { AxiosError } from "axios";
import { ActionFunctionArgs, redirect } from "react-router";

export const loginAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);
  // const authData = {
  //   phone: formData.get("phone"),
  //   password: formData.get("password"),
  // };

  try {
    // const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(credentials), // Convert to JSON
    //   credentials: "include", // send httpOnly cookies
    // });

    const response = await authApi.post("/login", credentials);

    if (response.status !== 200) {
      return { error: response.data || "Login failed!" };
    }

    const redirectTo = new URL(request.url).searchParams.get("redirect") || "/";

    return redirect(redirectTo);
  } catch (error) {
    console.error("Login failed", error);
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Login failed!" };
    }
    throw error;
  }
};

export const logoutAction = async () => {
  try {
    await api.post("/logout");
    return redirect("/login");
  } catch (error) {
    console.error("Logout failed", error);
  }
};

export const registerAction = async ({ request }: ActionFunctionArgs) => {
  const authStore = useAuthStore.getState();
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);

  try {
    const response = await authApi.post("/register", credentials);
    console.log("response", response);

    if (response.status !== 200) {
      return { error: response.data || "Sending OTP failed!" };
    }

    // client state management
    const { phone, token } = response.data;
    authStore.setAuth(phone, token, Status.otp);

    return redirect("/register/otp");
  } catch (error) {
    console.error("Sending OTP failed!", error);
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Sending OTP failed!" };
    }
    throw error;
  }
};

export const otpAction = async ({ request }: ActionFunctionArgs) => {
  const authStore = useAuthStore.getState();
  const formData = await request.formData();

  const credentials = {
    phone: authStore.phone,
    otp: formData.get("otp"),
    token: authStore.token,
  };

  try {
    const response = await authApi.post("/verify-otp", credentials);

    if (response.status !== 200) {
      return { error: response.data || "Verifying OTP failed!" };
    }

    // client state management
    const { phone, token } = response.data;
    authStore.setAuth(phone, token, Status.confirm);

    return redirect("/register/confirm-password");
  } catch (error) {
    console.error("Verifying OTP failed!", error);
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Verifying OTP failed!" };
    }
    throw error;
  }
};

export const confirmPasswordAction = async ({
  request,
}: ActionFunctionArgs) => {
  const authStore = useAuthStore.getState();
  const formData = await request.formData();

  const credentials = {
    phone: authStore.phone,
    password: formData.get("password"),
    token: authStore.token,
  };

  try {
    const response = await authApi.post("/confirm-password", credentials);

    if (response.status !== 201) {
      return { error: response.data || "Registration failed!" };
    }

    // client state management
    authStore.clearAuth();

    return redirect("/");
  } catch (error) {
    console.error("Registration failed!", error);
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Registration failed!" };
    }
    throw error;
  }
};
