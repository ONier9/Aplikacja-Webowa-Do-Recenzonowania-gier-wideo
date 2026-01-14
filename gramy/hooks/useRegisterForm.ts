import { useState, useCallback } from "react";

interface RegisterFormData {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useRegisterForm = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData({
      nickname: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }, []);

  return {
    formData,
    handleInputChange,
    resetForm,
  };
};
