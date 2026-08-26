import { Link } from "react-router-dom";

// The mobile counterpart to an admin data table — same row shape (a title,
// a handful of key/value fields, a status badge, optional row actions) but
// stacked instead of forced into horizontal scroll on narrow screens. Pair
// with a `hidden md:block` table and a `md:hidden` list of these.
export default function MobileDataCard({ title, titleTo, fields = [], status, actions }) {
  return (
    <div className="flex flex-col gap-3 border border-line p-4 w-4/5 mx-auto rounded-md">
      <div className="flex items-start justify-between gap-3">
        {titleTo ? (
          <Link to={titleTo} className="link-underline font-medium">
            {title}
          </Link>
        ) : (
          <span className="font-medium">{title}</span>
        )}
        {status}
      </div>

      <dl className="flex flex-col gap-1.5 text-sm">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>

      {actions && (
        <div className="flex items-center gap-4 border-t border-line pt-3">{actions}</div>
      )}
    </div>
  );
}
