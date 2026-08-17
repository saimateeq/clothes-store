import OrdersList from "../components/OrdersList";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Orders() {
  useDocumentTitle("Your Orders");
  return (
    <div className="mx-auto max-w-[1000px] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-10 flex flex-col gap-2">
        <span className="label text-accent">Order History</span>
        <h1 className="font-heading text-5xl sm:text-6xl">Your Orders</h1>
      </div>
      <OrdersList />
    </div>
  );
}
