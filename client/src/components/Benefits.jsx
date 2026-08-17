import { Truck, RotateCcw, ShieldCheck, Headset } from "lucide-react";

const BENEFITS = [
  { icon: Truck, title: "Free Shipping", description: "On orders over $100" },
  { icon: RotateCcw, title: "Easy Returns", description: "30-day returns" },
  { icon: ShieldCheck, title: "Secure Payment", description: "100% secure checkout" },
  { icon: Headset, title: "Customer Support", description: "We're here to help" },
];

export default function Benefits() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-8 px-5 py-14 sm:px-8 lg:grid-cols-4 lg:gap-6">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className="flex items-center gap-4">
            <benefit.icon size={22} strokeWidth={1.25} className="shrink-0 text-accent" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{benefit.title}</span>
              <span className="text-xs text-muted">{benefit.description}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
