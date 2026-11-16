"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Building2, Lock, Mail, User, ArrowRight, ShieldCheck, LogIn, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { registerAction, ActionState } from "@/app/actions/auth";

export default function AgentRegister() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(registerAction, undefined);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 font-sans p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Create Account</h2>
          <p className="text-slate-500 font-medium">Join LuxeEstates as an agent</p>
        </div>

        {state?.message && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{state.message}</span>
          </div>
        )}

        <form action={action} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                First Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={`block w-full pl-10 pr-3.5 py-3 bg-slate-50 border ${
                    state?.errors?.firstName ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"
                  } rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm focus:bg-white`}
                  placeholder="John"
                  required
                />
              </div>
              {state?.errors?.firstName && (
                <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.firstName[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Last Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={`block w-full pl-10 pr-3.5 py-3 bg-slate-50 border ${
                    state?.errors?.lastName ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"
                  } rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm focus:bg-white`}
                  placeholder="Doe"
                  required
                />
              </div>
              {state?.errors?.lastName && (
                <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.lastName[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                className={`block w-full pl-10 pr-3.5 py-3 bg-slate-50 border ${
                  state?.errors?.email ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"
                } rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm focus:bg-white`}
                placeholder="agent@luxeestates.com"
                required
              />
            </div>
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                className={`block w-full pl-10 pr-3.5 py-3 bg-slate-50 border ${
                  state?.errors?.password ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"
                } rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm focus:bg-white`}
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.password[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`block w-full pl-10 pr-3.5 py-3 bg-slate-50 border ${
                  state?.errors?.confirmPassword ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500"
                } rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm focus:bg-white`}
                placeholder="Re-enter your password"
                required
              />
            </div>
            {state?.errors?.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.confirmPassword[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:-translate-y-0.5 mt-4"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Register Account <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
          <p className="text-sm text-slate-600 font-medium text-center">
            Already have an account?{" "}
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign In <LogIn className="w-4 h-4 ml-0.5" />
            </Link>
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure SSL encrypted connection</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
