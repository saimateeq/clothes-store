import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Check } from "lucide-react";
import { selectCurrentUser, setCredentials } from "../../features/auth/authSlice";
import { useUpdateProfileMutation, useUpdatePasswordMutation } from "../../features/auth/authApi";
import TextField from "../../components/form/TextField";

function ProfileForm() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [updateProfile, { isLoading, isSuccess }] = useUpdateProfileMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" } });

  const onSubmit = async (values) => {
    const res = await updateProfile(values).unwrap().catch(() => null);
    if (res) dispatch(setCredentials(res.data.user));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-sm flex-col gap-5">
      <TextField label="Full Name" registration={register("name")} error={errors.name} />
      <TextField label="Phone" registration={register("phone")} error={errors.phone} />
      <TextField label="Email" value={user?.email ?? ""} disabled readOnly />
      <button
        type="submit"
        disabled={isLoading}
        className="label mt-2 w-fit bg-ink px-8 py-3.5 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        Save Changes
      </button>
      {isSuccess && (
        <span className="flex items-center gap-2 text-xs text-muted">
          <Check size={14} /> Profile updated
        </span>
      )}
    </form>
  );
}

function PasswordForm() {
  const [updatePassword, { isLoading, isSuccess, error }] = useUpdatePasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    const res = await updatePassword(values).unwrap().catch(() => null);
    if (res) reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-sm flex-col gap-5">
      <TextField
        label="Current Password"
        type="password"
        registration={register("currentPassword", { required: "Required" })}
        error={errors.currentPassword}
      />
      <TextField
        label="New Password"
        type="password"
        registration={register("newPassword", {
          required: "Required",
          minLength: { value: 8, message: "At least 8 characters" },
        })}
        error={errors.newPassword}
      />
      {error && <p className="text-xs text-accent">{error.data?.message || "Could not update password."}</p>}
      <button
        type="submit"
        disabled={isLoading}
        className="label mt-2 w-fit border border-ink px-8 py-3.5 transition-colors hover:bg-ink hover:text-bg disabled:opacity-50"
      >
        Update Password
      </button>
      {isSuccess && (
        <span className="flex items-center gap-2 text-xs text-muted">
          <Check size={14} /> Password updated
        </span>
      )}
    </form>
  );
}

export default function Profile() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex gap-6 border-b border-line">
        {["profile", "password"].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`label pb-4 capitalize ${
              tab === key ? "border-b border-ink text-ink" : "text-muted"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      {tab === "profile" ? <ProfileForm /> : <PasswordForm />}
    </div>
  );
}
