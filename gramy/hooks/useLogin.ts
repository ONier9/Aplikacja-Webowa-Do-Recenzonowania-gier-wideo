import { useState } from "react";
import { supabase } from "@/services/supabaseClient";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Login failed");

      setMessage("Login successful!");
      return true;
    } catch (error: any) {
      const errorMessage = error.message.includes("Invalid login credentials")
        ? "Invalid username/email or password"
        : error.message;

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    message,
    login,
  };
};
