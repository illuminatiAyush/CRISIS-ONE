import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AuthState } from "@/types/auth.type";
import { User } from "@/types/user.type";
import { useRouter } from "next/navigation";
import axios from "axios";
import { createAdmin } from "@/lib/supabase/admin"; 

export const signUpWithGoogle = createAsyncThunk("auth/google", async () => {
  const supabase = getSupabaseBrowserClient();

  // Supabase handles OAuth redirect automatically
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/login", // After verification / login
    },
  });

  if (error) throw error;

  return {
    message: "Redirecting to Google...",
  };
});

export const signUp = createAsyncThunk(
  "auth/signup",
  async ({
    email,
    password,
    role,
  }: {
    email: string;
    password: string;
    role: string;
  }) => {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    const response = await axios.post(
      "/api/auth/create-profile",
      {
        email,
        role,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data?.status);

    if (response.data?.status === "ALREADY_VERIFIED") {
      window.location.replace("/login");
    }

    if (
      response.data?.status === "NEW_PROFILE" ||
      response.data?.status === "OTP_REGENERATED" ||
      response.data?.status === "OTP_RESENT" ||
      response.data?.status === "OTP_SENT"
    ) {
      window.location.replace("/verify-otp");
    }

    return {
      message: "OTP sent to your email",
    };
  }
);

export const signInWithGoogle = createAsyncThunk("auth/google", async () => {
  const client = await getSupabaseBrowserClient();
  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) {
    console.log("Auth slice thunk: ", error);
    throw error;
  }
});

export const signIn = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Call your server API for login
      const res = await axios.post("/api/auth/login", { email, password });

      // If OTP not verified
      if (res.data.error === "OTP not verified") {
        return rejectWithValue("OTP not verified. Please verify your email.");
      }

      // Return the user object
      return res.data.profile as User;
    } catch (err: any) {
      console.error("Login error:", err);

      const message =
        err.response?.data?.error || "Login failed. Please try again.";

      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/auth/me");
      if (res.data.status !== 200) throw new Error("Unauthorized");

      const data = res.data;
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);


export const signOut = createAsyncThunk("auth/logout", async () => {
  const client = await getSupabaseBrowserClient();
  await client.auth.signOut();
});

const initialState: AuthState = {
  user: null,
  profile: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action)=>{
      state.profile = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(signUp.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signIn.fulfilled, (state, action)=>{
        state.status = "authenticated"
        state.profile = action.payload
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        console.log("action.payload", action.payload)
        state.status = "authenticated";
        state.user = action.payload.user
        state.profile = action.payload.profile
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "error";
        state.user = null;
        state.profile = null;
        state.error = action.payload as string;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
