import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Star } from "lucide-react";
import {
  useListAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from "../../features/auth/authApi";
import TextField from "../../components/form/TextField";

function AddressForm({ onDone }) {
  const [createAddress, { isLoading }] = useCreateAddressMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    const res = await createAddress(values).unwrap().catch(() => null);
    if (res) onDone();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-4 border border-line p-6 sm:grid-cols-2"
    >
      <TextField label="Full Name" registration={register("fullName", { required: "Required" })} error={errors.fullName} />
      <TextField label="Phone" registration={register("phone", { required: "Required" })} error={errors.phone} />
      <TextField label="Address Line 1" registration={register("line1", { required: "Required" })} error={errors.line1} />
      <TextField label="Address Line 2" registration={register("line2")} error={errors.line2} />
      <TextField label="City" registration={register("city", { required: "Required" })} error={errors.city} />
      <TextField label="State" registration={register("state")} error={errors.state} />
      <TextField label="Postal Code" registration={register("postalCode", { required: "Required" })} error={errors.postalCode} />
      <TextField label="Country" registration={register("country", { required: "Required" })} defaultValue="United States" error={errors.country} />

      <div className="col-span-full flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="label bg-ink px-6 py-3 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          Save Address
        </button>
        <button type="button" onClick={onDone} className="label text-muted hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function Addresses() {
  const [adding, setAdding] = useState(false);
  const { data, isLoading } = useListAddressesQuery();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const addresses = data?.data?.addresses ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="label text-muted">Saved Addresses</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="label flex items-center gap-2 text-ink"
          >
            <Plus size={14} /> Add Address
          </button>
        )}
      </div>

      {adding && <AddressForm onDone={() => setAdding(false)} />}

      {isLoading ? (
        <p className="text-sm text-muted">Loading addresses…</p>
      ) : addresses.length === 0 && !adding ? (
        <p className="text-sm text-muted">You haven't saved any addresses yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address._id} className="flex flex-col gap-2 border border-line p-5">
              <div className="flex items-start justify-between">
                <span className="font-medium">{address.fullName}</span>
                {address.isDefault && (
                  <span className="label flex items-center gap-1 text-accent">
                    <Star size={11} fill="currentColor" /> Default
                  </span>
                )}
              </div>
              <p className="text-sm text-muted">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.country}
              </p>
              <p className="text-sm text-muted">{address.phone}</p>
              <div className="mt-2 flex items-center gap-4">
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => updateAddress({ id: address._id, isDefault: true })}
                    className="link-underline text-xs"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteAddress(address._id)}
                  className="flex items-center gap-1 text-xs text-muted hover:text-ink"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
