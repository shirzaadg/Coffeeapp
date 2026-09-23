import { Link } from 'react-router-dom'

export default function PageHeader({ title, back, action }) {
  return (
    <header className="page-header">
      {back && (
        <Link to={back} className="back-link" aria-label="Back">
          ‹
        </Link>
      )}
      <h1>{title}</h1>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  )
}
