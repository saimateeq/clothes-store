import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerSchema } from "../../features/auth/authSchemas";
import { useRegisterMutation } from "../../features/auth/authApi";
import { setCredentials } from "../../features/auth/authSlice";
import TextField from "../../components/form/TextField";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

// Direct registration — no email/OTP verification step. The two-step OTP
// flow (request-otp + verify-otp) still exists server-side and is just
// unused here; it needs a verified Resend sending domain to email anyone
// other than the account owner, which isn't set up yet.
export default function Register() {
  useDocumentTitle("Create Account");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    const res = await register(values).unwrap().catch(() => null);
    if (res) {
      dispatch(setCredentials(res.data.user));
      navigate("/account", { replace: true });
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <span className="label text-accent">Join Velora</span>
      <h1 className="mt-2 font-heading text-4xl sm:text-5xl">Create Account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-5" noValidate>
        <TextField label="Full Name" autoComplete="name" registration={registerField("name")} error={errors.name} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          registration={registerField("email")}
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          showPasswordToggle
          autoComplete="new-password"
          registration={registerField("password")}
          error={errors.password}
        />

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
          {isLoading ? "Creating Account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="link-underline text-ink">
          Log in
        </Link>
      </p>
    </div>
  );
}
