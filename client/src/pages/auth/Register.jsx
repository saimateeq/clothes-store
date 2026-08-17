import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerSchema, otpSchema } from "../../features/auth/authSchemas";
import { useRequestRegistrationOtpMutation, useVerifyRegistrationOtpMutation } from "../../features/auth/authApi";
import { setCredentials } from "../../features/auth/authSlice";
import TextField from "../../components/form/TextField";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const RESEND_COOLDOWN = 30;

function DetailsStep({ onRequested }) {
  const [requestOtp, { isLoading, error }] = useRequestRegistrationOtpMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    const res = await requestOtp(values).unwrap().catch(() => null);
    if (res) onRequested(values);
  };

  return (
    <>
      <span className="label text-accent">Join Velora</span>
      <h1 className="mt-2 font-heading text-4xl sm:text-5xl">Create Account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-5" noValidate>
        <TextField label="Full Name" autoComplete="name" registration={register("name")} error={errors.name} />
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
          autoComplete="new-password"
          registration={register("password")}
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
          {isLoading ? "Sending Code…" : "Continue"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="link-underline text-ink">
          Log in
        </Link>
      </p>
    </>
  );
}

function OtpStep({ details, onBack }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resendError, setResendError] = useState(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [verifyOtp, { isLoading: isVerifying, error: verifyError }] = useVerifyRegistrationOtpMutation();
  const [requestOtp, { isLoading: isResending }] = useRequestRegistrationOtpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(otpSchema) });
  const { ref: otpFieldRef, ...otpField } = register("otp");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = async (values) => {
    const res = await verifyOtp({ email: details.email, otp: values.otp }).unwrap().catch(() => null);
    if (res) {
      dispatch(setCredentials(res.data.user));
      navigate("/account", { replace: true });
    }
  };

  const handleResend = async () => {
    setResendError(null);
    setResendSuccess(false);
    const res = await requestOtp(details).unwrap().catch((err) => {
      setResendError(err.data?.message || "Could not resend the code.");
      return null;
    });
    if (res) {
      setResendSuccess(true);
      setCooldown(RESEND_COOLDOWN);
    }
  };

  return (
    <>
      <span className="label text-accent">Check Your Inbox</span>
      <h1 className="mt-2 font-heading text-4xl sm:text-5xl">Verify Email</h1>
      <p className="mt-4 text-sm text-muted">
        We sent a 6-digit code to <span className="text-ink">{details.email}</span>.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-5" noValidate>
        <label className="flex flex-col gap-2">
          <span className="label text-muted">Verification Code</span>
          <input
            {...otpField}
            ref={(el) => {
              otpFieldRef(el);
              inputRef.current = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            aria-invalid={Boolean(errors.otp)}
            className={`w-full border bg-transparent px-4 py-3 text-center font-heading text-2xl tracking-[0.5em] outline-none transition-colors focus:border-ink ${
              errors.otp ? "border-accent" : "border-line"
            }`}
          />
          {errors.otp && <span className="text-xs text-accent">{errors.otp.message}</span>}
        </label>

        {verifyError && (
          <p role="alert" className="text-xs text-accent">
            {verifyError.data?.message || "Something went wrong. Please try again."}
          </p>
        )}

        <button
          type="submit"
          disabled={isVerifying}
          className="label mt-2 bg-ink py-4 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {isVerifying ? "Verifying…" : "Verify & Create Account"}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm">
        {resendSuccess && <p className="text-xs text-muted">A new code was sent.</p>}
        {resendError && <p className="text-xs text-accent">{resendError}</p>}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="label text-muted transition-colors hover:text-ink disabled:opacity-50"
        >
          {isResending ? "Sending…" : cooldown > 0 ? `Resend Code (${cooldown}s)` : "Resend Code"}
        </button>
        <button type="button" onClick={onBack} className="link-underline text-xs text-muted">
          Use a different email
        </button>
      </div>
    </>
  );
}

export default function Register() {
  useDocumentTitle("Create Account");
  const [step, setStep] = useState("details");
  const [details, setDetails] = useState(null);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      {step === "details" ? (
        <DetailsStep
          onRequested={(values) => {
            setDetails(values);
            setStep("otp");
          }}
        />
      ) : (
        <OtpStep details={details} onBack={() => setStep("details")} />
      )}
    </div>
  );
}
