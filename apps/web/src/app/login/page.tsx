"use client";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { useState } from "react";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <div className="flex flex-col items-center justify-center">
      <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center">
      <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
    </div>
  );
}
