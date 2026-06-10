export default function Divider({ symbol = '✦' }: { symbol?: string }) {
  return (
    <div className="star-divider" aria-hidden="true">
      <span>{symbol}</span>
    </div>
  );
}