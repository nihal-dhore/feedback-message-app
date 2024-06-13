"use client";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Signin() {
  //const session = useSession();

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <button
        className="border border-gray-500 px-8 py-3 rounded-xl"
        onClick={() => signIn()}
      >
        Signin
      </button>
    </div>
  );
}
