import { forwardRef, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { SAFEQUEST_BRAND } from "@/lib/branding";

export const LETTERHEAD_PAGE_MM = 297;
export const LETTERHEAD_WIDTH_MM = 210;
export const LETTERHEAD_MARGIN_TOP_MM = 54;
export const LETTERHEAD_MARGIN_BOTTOM_MM = 44;
export const LETTERHEAD_MARGIN_X_MM = 16;

export const LetterheadPage = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => {
    const localRef = useRef<HTMLDivElement | null>(null);
    const [pages, setPages] = useState(1);

    const setRefs = (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    useLayoutEffect(() => {
      const el = localRef.current;
      if (!el) return;
      const measure = () => {
        const pxPerMm = el.offsetWidth / LETTERHEAD_WIDTH_MM || 1;
        setPages(Math.max(1, Math.ceil(el.scrollHeight / (LETTERHEAD_PAGE_MM * pxPerMm) - 0.01)));
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    return (
      <div
        ref={setRefs}
        className="letterhead-page mx-auto text-black"
        style={{
          width: `${LETTERHEAD_WIDTH_MM}mm`,
          minHeight: `${LETTERHEAD_PAGE_MM}mm`,
          position: "relative",
          backgroundColor: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: SAFEQUEST_BRAND.ink,
        }}
      >
        <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {Array.from({ length: pages }).map((_, i) => (
            <img
              key={i}
              src={SAFEQUEST_BRAND.letterhead}
              alt=""
              style={{
                display: "block",
                width: `${LETTERHEAD_WIDTH_MM}mm`,
                height: `${LETTERHEAD_PAGE_MM}mm`,
              }}
            />
          ))}
        </div>
        <div
          data-letterhead-content
          style={{
            position: "relative",
            padding: `${LETTERHEAD_MARGIN_TOP_MM}mm ${LETTERHEAD_MARGIN_X_MM}mm ${LETTERHEAD_MARGIN_BOTTOM_MM}mm`,
          }}
        >
          {children}
        </div>
      </div>
    );
  },
);

LetterheadPage.displayName = "LetterheadPage";
