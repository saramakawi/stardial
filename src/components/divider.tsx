export default function Divider({ symbol = '✦' }: { symbol?: string }) {
  return (
    <div className="atlas-divider" aria-hidden="true">
      <span>{symbol}</span>
    </div>
  );
}