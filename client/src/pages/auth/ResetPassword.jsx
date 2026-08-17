import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPasswordSchema } from "../../features/auth/authSchemas";
import { useResetPasswordMutation } from "../../features/auth/authApi";
import { setCredentials } from "../../features/auth/authSlice";
import TextField from "../../components/form/TextField";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  if (!token) return <Navigate to="/forgot-password" replace />;

  const onSubmit = async (values) => {
    const res = await resetPassword({ token, password: values.password })
      .unwrap()
      .catch(() => null);
    if (res) {
      dispatch(setCredentials(res.data.user));
      navigate("/account", { replace: true });
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <span className="label text-accent">Account Recovery</span>
      <h1 className="mt-2 font-heading text-4xl sm:text-5xl">Reset Password</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-5" noValidate>
        <TextField
          label="New Password"
          type="password"
          autoComplete="new-password"
          registration={register("password")}
          error={errors.password}
        />
        <TextField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword}
        />

        {error && (
          <p role="alert" className="text-xs text-accent">
            {error.data?.message || "This reset link is invalid or has expired."}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="label mt-2 bg-ink py-4 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {isLoading ? "Resetting…" : "Reset Password"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        <Link to="/login" className="link-underline text-ink">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
