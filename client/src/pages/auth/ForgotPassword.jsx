import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { forgotPasswordSchema } from "../../features/auth/authSchemas";
import { useForgotPasswordMutation } from "../../features/auth/authApi";
import TextField from "../../components/form/TextField";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values) => {
    await forgotPassword(values).unwrap().catch(() => null);
    setSent(true);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <span className="label text-accent">Account Recovery</span>
      <h1 className="mt-2 font-heading text-4xl sm:text-5xl">Forgot Password</h1>

      {sent ? (
        <p className="mt-8 text-sm leading-relaxed text-muted">
          If an account exists for that email, we've sent a link to reset your password. It
          expires in 30 minutes.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">
            Enter your email and we'll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5" noValidate>
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              registration={register("email")}
              error={errors.email}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="label mt-2 bg-ink py-4 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {isLoading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        </>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        <Link to="/login" className="link-underline text-ink">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
