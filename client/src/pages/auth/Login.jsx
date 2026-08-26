import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSchema } from "../../features/auth/authSchemas";
import { useLoginMutation } from "../../features/auth/authApi";
import { setCredentials } from "../../features/auth/authSlice";
import TextField from "../../components/form/TextField";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function Login() {
  useDocumentTitle("Log In");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from;

  const [login, { isLoading, error }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    const res = await login(values).unwrap().catch(() => null);
    if (res) {
      const user = res.data.user;
      dispatch(setCredentials(user));
      // Respect an explicit redirect (e.g. bounced here from a protected
      // checkout page) over role — only fall back to a role-based default
      // when the user landed on /login directly.
      const isStaff = user.role === "admin" || user.role === "manager";
      navigate(redirectTo ?? (isStaff ? "/admin" : "/account"), { replace: true });
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <span className="label text-accent">Welcome Back</span>
      <h1 className="mt-2 font-heading text-4xl sm:text-5xl">Log In</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-5" noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          registration={register("email")}
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          showPasswordToggle
          autoComplete="current-password"
          registration={register("password")}
          error={errors.password}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="link-underline text-xs text-muted">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="text-xs text-accent">
            {error.data?.message || "Something went wrong. Please try again."}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="label mt-2 bg-ink py-4 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {isLoading ? "Logging In…" : "Log In"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New to VELORA?{" "}
        <Link to="/register" className="link-underline text-ink">
          Create an account
        </Link>
      </p>
    </div>
  );
}
