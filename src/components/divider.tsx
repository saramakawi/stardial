// This component is a star icon divider that is used to separate sections of the app. 
// It takes an optional `symbol` prop that defaults to a star symbol (✦) but can be customized to any string. 
// The divider is styled with a class name "atlas-divider" which can be defined in the CSS to achieve 
// the desired look.

export default function Divider({ symbol = '✦' }: { symbol?: string }) {
  return (
    <div className="atlas-divider" aria-hidden="true">
      <span>{symbol}</span>
    </div>
  );
}