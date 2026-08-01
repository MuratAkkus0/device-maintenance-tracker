import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/devices", label: "Devices" },
  { to: "/staff", label: "Staff" },
  { to: "/rooms", label: "Rooms" },
];

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <div className="app-nav__brand">Wartungstermine</div>
      <ul className="app-nav__links">
        {NAV_LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) => `app-nav__link${isActive ? " is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="app-nav__footer">
        <div className="app-nav__user">
          <span className="app-nav__user-name">{user?.name}</span>
          <span className="app-nav__user-role">{user?.role?.toLowerCase()}</span>
        </div>
        <button type="button" className="app-nav__logout" onClick={logout}>
          Log out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
