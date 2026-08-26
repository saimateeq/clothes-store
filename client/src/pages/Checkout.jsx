import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Check, Tag } from "lucide-react";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useListAddressesQuery } from "../features/auth/authApi";
import { useCreatePaymentIntentMutation } from "../features/payments/paymentsApi";
import { useCreateOrderMutation, useCreateCodOrderMutation } from "../features/orders/ordersApi";
import { useValidateCouponMutation } from "../features/coupons/couponsApi";
import { useCart } from "../context/CartContext";
import { stripePromise, isStripeEnabled } from "../lib/stripe";
import TextField from "../components/form/TextField";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const STEPS = ["Contact", "Shipping", "Delivery", "Payment"];

const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_RATES = { standard: 8, express: 20 };

function OrderSummary({ items, shippingMethod, coupon, onApplyCoupon, onRemoveCoupon, couponError, isApplyingCoupon }) {
  const [couponInput, setCouponInput] = useState("");
  const subtotal = items.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATES[shippingMethod];
  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  return (
    <aside className="flex h-fit flex-col gap-6 border border-line p-6 lg:sticky lg:top-28">
      <h2 className="label">Order Summary</h2>
      <ul className="flex flex-col gap-4">
        {items.map((line) => (
          <li key={line.key} className="flex gap-3">
            <img src={line.image} alt="" className="h-16 w-14 object-cover" />
            <div className="flex flex-1 flex-col text-sm">
              <span className="font-medium">{line.name}</span>
              <span className="text-muted">
                {line.color} / {line.size} × {line.quantity}
              </span>
            </div>
            <span className="text-sm">${(line.price * line.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      {coupon ? (
        <div className="flex items-center justify-between border border-line px-3 py-2 text-sm">
          <span className="flex items-center gap-2">
            <Tag size={13} className="text-accent" />
            {coupon.code}
          </span>
          <button type="button" onClick={onRemoveCoupon} className="text-xs text-muted hover:text-ink">
            Remove
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (couponInput.trim()) onApplyCoupon(couponInput.trim());
          }}
          className="flex gap-2"
        >
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Coupon code"
            className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={isApplyingCoupon}
            className="label shrink-0 border border-ink px-4 text-xs transition-colors hover:bg-ink hover:text-bg disabled:opacity-50"
          >
            Apply
          </button>
        </form>
      )}
      {couponError && <p className="text-xs text-accent">{couponError}</p>}

      <div className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Shipping</span>
          <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-accent">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between border-t border-line pt-4 font-heading text-xl">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </aside>
  );
}

function AddressForm({ onSubmit, defaultValues, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField label="Full Name" registration={register("fullName", { required: "Required" })} error={errors.fullName} />
      <TextField label="Phone" registration={register("phone", { required: "Required" })} error={errors.phone} />
      <TextField label="Address Line 1" registration={register("line1", { required: "Required" })} error={errors.line1} />
      <TextField label="Address Line 2" registration={register("line2")} error={errors.line2} />
      <TextField label="City" registration={register("city", { required: "Required" })} error={errors.city} />
      <TextField label="State" registration={register("state")} error={errors.state} />
      <TextField label="Postal Code" registration={register("postalCode", { required: "Required" })} error={errors.postalCode} />
      <TextField
        label="Country"
        registration={register("country", { required: "Required" })}
        defaultValue={defaultValues?.country ?? "United States"}
        error={errors.country}
      />
      <button
        type="submit"
        className="label col-span-full mt-2 w-fit bg-ink px-8 py-4 text-bg transition-opacity hover:opacity-85"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function PaymentStep({ clientSecret, onSuccess, totalLabel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
      return;
    }
    onSuccess(paymentIntent.id);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      {error && <p className="text-xs text-accent">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="label w-full bg-ink py-4 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {submitting ? "Processing…" : `Pay ${totalLabel}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  useDocumentTitle("Checkout");
  const user = useSelector(selectCurrentUser);
  const { items, subtotal } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [clientSecret, setClientSecret] = useState(null);
  const [intentError, setIntentError] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(isStripeEnabled ? "card" : "cod");
  const [codError, setCodError] = useState(null);

  const { data: addressesData } = useListAddressesQuery();
  const savedAddresses = addressesData?.data?.addresses ?? [];

  const [createPaymentIntent, { isLoading: isCreatingIntent }] = useCreatePaymentIntentMutation();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [createCodOrder, { isLoading: isCreatingCodOrder }] = useCreateCodOrderMutation();
  const [validateCoupon, { isLoading: isApplyingCoupon }] = useValidateCouponMutation();

  // Re-request the PaymentIntent whenever the shipping method or applied
  // coupon changes — its amount is only valid for the totals it was created
  // with, so a stale clientSecret here would charge the wrong amount.
  useEffect(() => {
    setClientSecret(null);
  }, [shippingMethod, coupon?.code]);

  useEffect(() => {
    if (step === 3 && paymentMethod === "card" && isStripeEnabled && !clientSecret && items.length > 0) {
      createPaymentIntent({ shippingMethod, couponCode: coupon?.code })
        .unwrap()
        .then((res) => setClientSecret(res.data.clientSecret))
        .catch((err) => setIntentError(err.data?.message || "Could not start payment"));
    }
  }, [step, paymentMethod, clientSecret, shippingMethod, coupon?.code, items.length, createPaymentIntent]);

  const handleApplyCoupon = async (code) => {
    setCouponError(null);
    const res = await validateCoupon({ code, shippingMethod })
      .unwrap()
      .catch((err) => {
        setCouponError(err.data?.message || "This coupon code is not valid");
        return null;
      });
    if (res) setCoupon({ code: res.data.code, discount: res.data.discount });
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-5 py-32 text-center">
        <h1 className="font-heading text-3xl">Your Bag Is Empty</h1>
        <p className="text-sm text-muted">Add something to your bag before checking out.</p>
      </div>
    );
  }

  const handlePaymentSuccess = async (paymentIntentId) => {
    const res = await createOrder({
      paymentIntentId,
      shippingAddress,
      billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
      shippingMethod,
    })
      .unwrap()
      .catch((err) => {
        setIntentError(err.data?.message || "Could not finalize your order");
        return null;
      });
    if (res) navigate(`/order-success?order=${res.data.order._id}`, { replace: true });
  };

  const handlePlaceCodOrder = async () => {
    setCodError(null);
    const res = await createCodOrder({
      shippingAddress,
      billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
      shippingMethod,
      couponCode: coupon?.code,
    })
      .unwrap()
      .catch((err) => {
        setCodError(err.data?.message || "Could not place your order");
        return null;
      });
    if (res) navigate(`/order-success?order=${res.data.order._id}`, { replace: true });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-10 flex flex-col gap-2">
        <span className="label text-accent">Checkout</span>
        <h1 className="font-heading text-5xl sm:text-6xl">Secure Checkout</h1>
      </div>

      <div className="mb-10 flex items-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
                i < step ? "border-ink bg-ink text-bg" : i === step ? "border-ink" : "border-line text-muted"
              }`}
            >
              {i < step ? <Check size={13} /> : i + 1}
            </div>
            <span className={`label hidden sm:inline ${i === step ? "text-ink" : "text-muted"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-line" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          {step === 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="font-heading text-2xl">Contact Information</h2>
              <p className="text-sm text-muted">Order confirmation will be sent to</p>
              <p className="border border-line px-4 py-3 text-sm">{user?.email}</p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="label w-fit bg-ink px-8 py-4 text-bg transition-opacity hover:opacity-85"
              >
                Continue to Shipping
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h2 className="font-heading text-2xl">Shipping Address</h2>
              {savedAddresses.length > 0 && !shippingAddress && (
                <div className="flex flex-col gap-3">
                  <span className="label text-muted">Saved Addresses</span>
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => {
                        setShippingAddress(addr);
                        setStep(2);
                      }}
                      className="border border-line p-4 text-left text-sm transition-colors hover:border-ink"
                    >
                      {addr.fullName} — {addr.line1}, {addr.city}
                    </button>
                  ))}
                  <span className="label text-muted">Or enter a new address</span>
                </div>
              )}
              <AddressForm
                submitLabel="Continue to Delivery"
                onSubmit={(values) => {
                  setShippingAddress(values);
                  setStep(2);
                }}
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="font-heading text-2xl">Delivery Method</h2>
              <div className="flex flex-col gap-3">
                {[
                  { value: "standard", label: "Standard Shipping", eta: "3–6 business days", price: SHIPPING_RATES.standard },
                  { value: "express", label: "Express Shipping", eta: "1–2 business days", price: SHIPPING_RATES.express },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center justify-between border p-4 transition-colors ${
                      shippingMethod === option.value ? "border-ink" : "border-line"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === option.value}
                        onChange={() => setShippingMethod(option.value)}
                        className="accent-ink"
                      />
                      <span>
                        <span className="block text-sm font-medium">{option.label}</span>
                        <span className="block text-xs text-muted">{option.eta}</span>
                      </span>
                    </span>
                    <span className="text-sm">
                      {subtotal >= FREE_SHIPPING_THRESHOLD ? "Free" : `$${option.price.toFixed(2)}`}
                    </span>
                  </label>
                ))}
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                  className="accent-ink"
                />
                Billing address same as shipping
              </label>

              {!billingSameAsShipping && (
                <div className="flex flex-col gap-4">
                  <h3 className="label text-muted">Billing Address</h3>
                  <AddressForm
                    submitLabel="Continue to Payment"
                    onSubmit={(values) => {
                      setBillingAddress(values);
                      setStep(3);
                    }}
                  />
                </div>
              )}

              {billingSameAsShipping && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="label w-fit bg-ink px-8 py-4 text-bg transition-opacity hover:opacity-85"
                >
                  Continue to Payment
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <h2 className="font-heading text-2xl">Payment</h2>

              <div className="flex flex-col gap-3">
                {isStripeEnabled && (
                  <label
                    className={`flex cursor-pointer items-center gap-3 border p-4 transition-colors ${
                      paymentMethod === "card" ? "border-ink" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="accent-ink"
                    />
                    <span className="text-sm font-medium">Card</span>
                  </label>
                )}
                <label
                  className={`flex cursor-pointer items-center gap-3 border p-4 transition-colors ${
                    paymentMethod === "cod" ? "border-ink" : "border-line"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-ink"
                  />
                  <span className="text-sm font-medium">Cash on Delivery</span>
                </label>
              </div>

              {paymentMethod === "cod" ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-muted">Pay with cash when your order arrives.</p>
                  {codError && <p className="text-xs text-accent">{codError}</p>}
                  <button
                    type="button"
                    onClick={handlePlaceCodOrder}
                    disabled={isCreatingCodOrder}
                    className="label w-full bg-ink py-4 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
                  >
                    {isCreatingCodOrder ? "Placing Order…" : "Place Order"}
                  </button>
                </div>
              ) : !isStripeEnabled ? (
                <p className="border border-line p-4 text-sm text-muted">
                  Payments are not configured yet
                </p>
              ) : intentError ? (
                <p className="text-sm text-accent">{intentError}</p>
              ) : !clientSecret || isCreatingIntent ? (
                <p className="text-sm text-muted">Preparing secure payment…</p>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentStep
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                    totalLabel={isCreatingOrder ? "…" : ""}
                  />
                </Elements>
              )}
            </div>
          )}
        </div>

        <OrderSummary
          items={items}
          shippingMethod={shippingMethod}
          coupon={coupon}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
          couponError={couponError}
          isApplyingCoupon={isApplyingCoupon}
        />
      </div>
    </div>
  );
}
