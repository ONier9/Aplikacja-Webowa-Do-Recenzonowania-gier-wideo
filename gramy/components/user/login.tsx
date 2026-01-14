"use client";

import React, { useEffect } from 'react';
import { useModal } from '@/context/ModalContext';
import { useLogin } from '@/hooks/useLogin';
import { useLoginForm } from '@/hooks/useLoginForm';
import { ModalContainer } from './modal-container';
import { FormInput } from './form-input';
import { StatusMessage } from './status-message';
import { LoadingButton } from './loading-button';
import { SwitchAuthMode } from './switch-auth-mode';

const Login: React.FC = () => {
  const modal = useModal();
  const isLoginOpen = modal?.isLoginOpen ?? false;
  const closeLogin = modal?.closeLogin ?? (() => {});
  const openRegister = modal?.openRegister ?? (() => {});
  const { formData, handleInputChange, resetForm } = useLoginForm();
  const { loading, error, message, login } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    const success = await login(formData.email, formData.password);
    
    if (success) {
      closeLogin();
      window.location.reload(); 
    }
  };

  const handleSwitchToRegister = () => {
    closeLogin();
    openRegister();
  };

  useEffect(() => {
    if (!isLoginOpen) {
      resetForm();
    }
  }, [isLoginOpen, resetForm]);

  return (
    <ModalContainer
      isOpen={isLoginOpen}
      onClose={closeLogin}
      title="Welcome Back"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          id="email"
          name="email"
          type="text"
          label="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          required
        />
        
        <FormInput
          id="password"
          name="password"
          type="password"
          label="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        {error && <StatusMessage type="error" message={error} />}
        {message && <StatusMessage type="success" message={message} />}

        <LoadingButton
          loading={loading}
          loadingText="Signing in..."
          normalText="Sign In"
          disabled={!formData.email || !formData.password}
        />
      </form>
      
      <SwitchAuthMode
        prompt="Don't have an account?"
        linkText="Sign up"
        onClick={handleSwitchToRegister}
      />
    </ModalContainer>
  );
};

export default Login;