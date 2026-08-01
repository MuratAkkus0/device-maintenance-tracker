import { MdInbox } from "react-icons/md";

function EmptyState({ message, icon: Icon = MdInbox }) {
  return (
    <div className="empty-state">
      <Icon className="empty-state__icon" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
