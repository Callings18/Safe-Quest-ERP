import { BrandLogo } from "@/components/BrandLogo";
import { PAYMENT_LOCK } from "@/lib/payment-lock";
import { Lock } from "lucide-react";

export function PaymentLockScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1F4A] px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <BrandLogo className="h-16 w-16" />
        </div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
          <Lock className="h-7 w-7 text-[#F5C400]" />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">{PAYMENT_LOCK.title}</h1>
          <p className="text-sm leading-relaxed text-white/80">{PAYMENT_LOCK.message}</p>
          <p className="text-xs text-white/50">{PAYMENT_LOCK.developerNote}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left space-y-1">
          <p className="text-sm font-medium text-[#F5C400]">{PAYMENT_LOCK.contactLabel}</p>
          <p className="text-xs text-white/70">{PAYMENT_LOCK.contactHint}</p>
        </div>
        <p className="text-[11px] uppercase tracking-wider text-white/30">SafeQuest ERP · Access restricted</p>
      </div>
    </div>
  );
}
