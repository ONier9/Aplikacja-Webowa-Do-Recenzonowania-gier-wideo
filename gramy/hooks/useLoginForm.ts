import { useState, useCallback } from "react";

interface FormData {
  email: string;
  password: string;
}

export const useLoginForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData({ email: "", password: "" });
  }, []);

  return {
    formData,
    handleInputChange,
    resetForm,
  };
};
