import { createClient } from "matrix-js-sdk";

const baseUrl = import.meta.env.VITE_BASE_URL;

export async function login(
  username: string,
  password: string
): Promise<{
  baseUrl: string;
  accessToken: string;
  userId: string;
  deviceId: string;
}> {
  try {
    const client = createClient({ baseUrl });

    const loginRes = await client.loginRequest({
      type: "m.login.password",
      identifier: {
        type: "m.id.user",
        user: username,
      },
      password,
    });

    // Change to another storage method
    localStorage.setItem("accessToken", loginRes.access_token);
    localStorage.setItem("userId", loginRes.user_id);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("deviceId", loginRes.device_id);

    return {
      baseUrl,
      accessToken: loginRes.access_token,
      userId: loginRes.user_id,
      deviceId: loginRes.device_id,
    };
  } catch (err: any) {
    console.error("Matrix login error:", err);
    throw new Error(err.message || "Failed to login");
  }
}

export async function register(
  username: string,
  password: string,
  confirmPassword: string
): Promise<{
  baseUrl: string;
  accessToken: string;
  userId: string;
  deviceId: string;
}> {
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  try {
    const client = createClient({ baseUrl });

    const regRes = await client.registerRequest({
      username,
      password,
      auth: { type: "m.login.dummy" },
      inhibit_login: false,
    });

    if (!regRes.access_token || !regRes.user_id || !regRes.device_id) {
      throw new Error("Invalid registration response from server");
    }

    // Change to another storage method
    localStorage.setItem("accessToken", regRes.access_token);
    localStorage.setItem("userId", regRes.user_id);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("deviceId", regRes.device_id);

    return {
      baseUrl,
      accessToken: regRes.access_token,
      userId: regRes.user_id,
      deviceId: regRes.device_id,
    };
  } catch (err: any) {
    console.error("Matrix register error:", err);
    throw new Error(err.message || "Failed to register");
  }
}
