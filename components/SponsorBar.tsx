export default function SponsorBar() {
  return (
    <div className="bg-gradient-to-r from-yellow-600 to-white-600 text-white text-center py-2 px-4 text-sm">
      <span>
        Sponsored by{" "}
        <a
          href="https://realoficial.com.br/?utm_source=GITMON"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline hover:no-underline"
        >
          REAL OFICIAL
        </a>
      </span>
    </div>
  );
}