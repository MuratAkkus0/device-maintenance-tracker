import { MdErrorOutline } from "react-icons/md";

function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="state-banner state-banner--error" role="alert">
      <MdErrorOutline aria-hidden="true" size={20} />
      <div>
        <p>{message}</p>
        {onRetry && (
          <button type="button" className="btn-link" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorBanner;
