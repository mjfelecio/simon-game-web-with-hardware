"use client";

import BaseModal from "@/globals/components/layouts/BaseModal";
import { SESSION_STORAGE_KEY } from "@/globals/constants/auth";
import { supabase } from "@/globals/libs/db";
import type { User } from "@/globals/types/auth";
import { useState } from "react";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: User) => void;
};

const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Try to find an existing user
      const { data: existingUser, error: selectError } = await supabase
        .from("users")
        .select("*")
        .eq("username", normalizedUsername)
        .maybeSingle();

      if (selectError) {
        throw selectError;
      }

      let user = existingUser;

      // If user doesn't exist, create one
      if (!user) {
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            username: normalizedUsername,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        user = newUser;
      }

      // Persist user session in browser storage
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));

      // Notify parent
      onLogin?.(user);

      // Reset and close
      setUsername("");
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        console.error("Login failed:", err);
        setError(err.message ?? "Something went wrong.");
      }

      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="space-y-8">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-bold text-white">Login</h2>
          <p className="text-sm text-white/60">
            Enter your username to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white/80"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. gamerXD420"
              maxLength={20}
              autoFocus
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/20"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || username.trim().length < 3}
            className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </BaseModal>
  );
};

export default LoginModal;
