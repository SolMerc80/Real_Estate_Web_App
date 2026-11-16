"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, UserPlus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { loginAction, ActionState } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/agent/ThemeToggle";

export default function AgentLogin() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(loginAction, undefined);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans p-6 sm:p-12 transition-colors relative">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">Welcome</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Sign in to access your agent portal</p>
        </div>

        {state?.message && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-red-700 dark:text-red-300 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 dark:text-red-400" />
            <span>{state.message}</span>
          </div>
        )}

        <form action={action} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border ${
                  state?.errors?.email ? "border-red-400 dark:border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                } rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm focus:bg-white dark:focus:bg-slate-900`}
                placeholder="Email Address"
                required
              />
            </div>
            {state?.errors?.email && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border ${
                  state?.errors?.password ? "border-red-400 dark:border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                } rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm focus:bg-white dark:focus:bg-slate-900`}
                placeholder="••••••••"
                required
              />
            </div>
            {state?.errors?.password && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{state.errors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:-translate-y-0.5 mt-2"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Create Account <UserPlus className="w-4 h-4 ml-0.5" />
            </Link>
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure SSL encrypted connection</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
