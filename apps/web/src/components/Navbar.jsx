import { Link } from "react-router-dom";
function Navbar() {
  return (
    <>
      <menu>
        <div className="app__logo">Wartungstermine Verwalten</div>
        <li className="menu__item">
          <Link className="a__link" to={"/"}>
            Dashboard
          </Link>
        </li>
        <li className="menu__item">
          <Link className="a__link" to={"/add-item"}>
            Add New Device
          </Link>
        </li>
        <li className="menu__item">
          <Link className="a__link" to={"/add-personal"}>
            Add New Personal
          </Link>
        </li>
        <li className="menu__item">
          <Link className="a__link" to={"/add-room"}>
            Add New Room
          </Link>
        </li>
      </menu>
    </>
  );
}

export default Navbar;
