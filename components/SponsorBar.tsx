export default function SponsorBar() {
  return (
    <div className="to-white-600 bg-gradient-to-r from-yellow-600 px-4 py-2 text-center text-sm text-white">
      <span>
        Sponsored by{' '}
        <a
          href="https://t.co/4E8Ciww11J"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline hover:no-underline"
        >
          KODUS
        </a>
        {' • '}
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
