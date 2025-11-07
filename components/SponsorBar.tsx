"use client";

export default function SponsorBar() {

  return (
    <>
      <div className="bg-gradient-to-r from-gray-500 to-white-600 text-white text-center py-2 px-4 text-sm">
        <div className="flex items-center justify-center gap-6">
          <span>
            Sponsored by{" "}
            <a
              href="https://t.co/4E8Ciww11J"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:no-underline"
            >
              KODUS
            </a>
            {" • "}
            <a
              href="https://realoficial.com.br/?utm_source=GITMON"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:no-underline"
            >
              REAL OFICIAL
            </a>
            {" • "}
            <button
              onClick={() => window.dispatchEvent(new Event('openSupportModal'))}
              className="font-semibold underline hover:no-underline text-black hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
            >
              1 SEAT LEFT
            </button>
          </span>
        </div>
      </div>
    </>
  );
}