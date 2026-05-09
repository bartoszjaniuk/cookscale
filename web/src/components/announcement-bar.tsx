export function AnnouncementBar() {
  return (
    <div
      className="w-full text-center text-[14px] py-2 px-4"
      style={{ background: "var(--color-announcement)" }}
    >
      <span className="mr-2">🔔</span>
      POC web — pierwsze 2 obliczenia bez rejestracji.
      <a href="/calculator" className="ml-2 underline underline-offset-4">
        Wypróbuj
      </a>
    </div>
  );
}
