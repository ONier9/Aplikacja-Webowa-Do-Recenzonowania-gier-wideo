"use client";

import React from "react";
import { useModal } from "@/context/ModalContext";
interface JoinButtonProps {
  isLoggedIn: boolean;
}

export default function JoinButton({ isLoggedIn }: JoinButtonProps) {
  const { openRegister } = useModal();

  const handleClick = () => {
    if (!isLoggedIn) {
      openRegister();
    } else {
      alert("You are already logged in!");
    }
  };

  return (
    <>
      <p className="mb-6 text-center text-xl text-gray-100 leading-relaxed">
        Your next favorite game is waiting.
        <br />
        We bring you authentic reviews,
        <br />
        recommendations from{" "}
        <span className="font-bold text-white">real players</span>
        <br />
        like <span className="font-bold text-white">you</span>
      </p>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleClick}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Join Now - It's Free
        </button>
      </div>
    </>
  );
}
