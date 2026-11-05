import Link from 'next/link';

interface AdoptionStatusProps {
  monsterName: string;
  adoptionData?: {
    sponsorName: string;
    sponsorUrl: string;
  };
}

export default function AdoptionStatus({ monsterName, adoptionData }: AdoptionStatusProps) {
  if (adoptionData) {
    return (
      <div className="text-center mb-4">
        <p className="text-xs text-green-600" style={{ fontFamily: 'Minecraftia, monospace' }}>
          SPONSORED BY{' '}
          <a
            href={adoptionData.sponsorUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="text-primary underline hover:no-underline"
          >
            {adoptionData.sponsorName}
          </a>
        </p>
      </div>
    );
  }

  // No per-item marketplace listing exists, so don't send people to a generic collection page.
  return (
    <div className="text-center mb-4">
      <Link
        href="/holders"
        className="text-xs text-muted-foreground hover:text-primary transition-colors underline hover:no-underline"
        style={{ fontFamily: 'Minecraftia, monospace' }}
      >
        SPONSOR {monsterName.toUpperCase()}
      </Link>
    </div>
  );
}
