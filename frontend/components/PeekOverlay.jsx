// Hover effect for photos: a light veil and an amber arrow that slides in. Put it inside a `group` element.
export default function PeekOverlay() {
  return (
    <>
      <span className="peek-veil" aria-hidden="true" />
      <span className="peek-chip" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </>
  );
}
