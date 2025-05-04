import { createClient } from "matrix-js-sdk";
import { saveSession } from "./storageSession";
import { log } from "console";

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

    saveSession(loginRes.access_token, loginRes.user_id, baseUrl, loginRes.device_id);

    return {
      baseUrl,
      accessToken: loginRes.access_token,
      userId: loginRes.user_id,
      deviceId: loginRes.device_id,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Matrix login error:", err);
      throw new Error(err.message || "Failed to login");
    } else {
      console.error("Matrix login error (non-Error):", err);
      throw new Error("Failed to login");
    }
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

    saveSession(regRes.access_token, regRes.user_id, baseUrl, regRes.device_id);

    return {
      baseUrl,
      accessToken: regRes.access_token,
      userId: regRes.user_id,
      deviceId: regRes.device_id,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Matrix register error:", err);
      throw new Error(err.message || "Failed to register");
    } else {
      console.error("Matrix register error (non-Error):", err);
      throw new Error("Failed to register");
    }
  }
}
