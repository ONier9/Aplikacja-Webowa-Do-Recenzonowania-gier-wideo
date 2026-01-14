import { useState } from "react";
import { supabase } from "@/services/supabaseClient";

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const validateForm = (formData: {
    nickname: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): boolean => {
    if (
      !formData.nickname ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.nickname.length < 3) {
      setError("Nickname must be at least 3 characters long");
      return false;
    }

    return true;
  };

  const register = async (formData: {
    nickname: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    setError("");
    setMessage("");

    if (!validateForm(formData)) {
      setLoading(false);
      return false;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nickname: formData.nickname,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          throw new Error(
            "This email is already registered. Please sign in instead."
          );
        }
        throw authError;
      }

      const user = authData.user;
      if (!user) {
        throw new Error("User creation failed. Please try again.");
      }

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        username: formData.nickname,
        email: formData.email,
      });

      if (profileError) {
        console.error("Error inserting into profiles:", profileError);
        throw new Error("User created, but profile setup failed.");
      }

      setMessage("Registration successful!");
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "An error occurred during registration");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    message,
    register,
  };
};
