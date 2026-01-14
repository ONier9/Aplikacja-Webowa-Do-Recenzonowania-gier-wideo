"use client";

import React, { useEffect } from 'react';
import { useModal } from '@/context/ModalContext';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { useRegister } from '@/hooks/useRegister';
import { ModalContainer } from './modal-container';
import { FormInput } from './form-input';
import { StatusMessage } from './status-message';
import { LoadingButton } from './loading-button';
import { SwitchAuthMode } from './switch-auth-mode';

const Register: React.FC = () => {
  const { isRegisterOpen, closeRegister, openLogin } = useModal();
  const { formData, handleInputChange, resetForm } = useRegisterForm();
  const { loading, error, message, register } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(formData);
    
    if (success) {
      closeRegister();
      window.location.reload(); 
    }
  };
  const handleSwitchToLogin = () => {
    closeRegister();
    openLogin();
  };

  useEffect(() => {
    if (!isRegisterOpen) {
      resetForm();
    }
  }, [isRegisterOpen, resetForm]);

  return (
    <ModalContainer
      isOpen={isRegisterOpen}
      onClose={closeRegister}
      title="Create Your Account"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          id="nickname"
          name="nickname"
          type="text"
          label="Username"
          value={formData.nickname}
          onChange={handleInputChange}
          placeholder="Enter your username"
          minLength={3}
          required
        />
        
        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />
        
        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Create a password (min. 6 characters)"
          autoComplete="new-password"
          minLength={6}
          required
        />
        
        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm your password"
          autoComplete="new-password"
          minLength={6}
          required
        />

        {error && <StatusMessage type="error" message={error} />}
        {message && <StatusMessage type="success" message={message} />}

        <LoadingButton
          loading={loading}
          loadingText="Creating account..."
          normalText="Create Account"
        />
        
        <div className="text-center text-xs text-neutral-500 mt-4">
          By registering, you agree to our Terms of Service and Privacy Policy
        </div>
      </form>
      
      <SwitchAuthMode
        prompt="Already have an account?"
        linkText="Sign in"
        onClick={handleSwitchToLogin}
      />
    </ModalContainer>
  );
};

export default Register;