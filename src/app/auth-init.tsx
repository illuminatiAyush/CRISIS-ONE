"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCurrentUser, setUser } from "@/store/slices/authSlice";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AuthInit() {
  const dispatch = useDispatch();
  const getUser = async ()=>{
    const supabase = getSupabaseBrowserClient();
    const { data: listener } = supabase.auth.onAuthStateChange(async() => {
      // @ts-expect-error: fetchCurrentUser is a thunk action
      const res = await dispatch(fetchCurrentUser());
      console.log(res)
    });

    return () => listener.subscription.unsubscribe();
    }

  useEffect(() => {
    // @ts-expect-error: fetchCurrentUser is a thunk action
    dispatch(fetchCurrentUser());

    getUser()
  }, []);

  return null;
}
