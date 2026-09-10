import { forwardRef, type ReactNode } from "react";
import { SAFEQUEST_BRAND } from "@/lib/branding";

export const LetterheadPage = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => {
    return (
      <div
        ref={ref}
        className="letterhead-page bg-white text-black mx-auto shadow-lg"
        style={{
          width: "210mm",
          minHeight: "297mm",
          backgroundImage: `url(${SAFEQUEST_BRAND.letterhead})`,
          backgroundSize: "210mm 297mm",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "top center",
          fontFamily: SAFEQUEST_BRAND.font,
          color: SAFEQUEST_BRAND.ink,
        }}
      >
        <div style={{ padding: "56mm 18mm 46mm 18mm" }}>{children}</div>
      </div>
    );
  },
);

LetterheadPage.displayName = "LetterheadPage";
