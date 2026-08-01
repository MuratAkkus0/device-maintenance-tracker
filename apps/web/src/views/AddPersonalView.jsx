import { useEffect, useState } from "react";
import AddPersonalForm from "../components/AddPersonalForm";
import ListItem from "../components/ListItem";
import Navbar from "../components/Navbar";
import "../assets/css/ItemList.css";

function AddPersonalView() {
  const [personalList, setPersonalList] = useState(
    JSON.parse(localStorage.getItem("personalList")) || []
  );
  useEffect(() => {
    localStorage.setItem("personalList", JSON.stringify(personalList));
  }, [personalList]);
  return (
    <>
      <Navbar />
      <div className="add__personal--container view__container">
        <AddPersonalForm
          personalList={personalList}
          setPersonalList={setPersonalList}
        />
        <div className="item__list  mt1rem width95">
          <div className="item__list--title room__list--title">
            <span>Id</span>
            <span>Full Name</span>
            <span>Departmant</span>
            <span>Controls</span>
          </div>
          <div className=" item__list--list room__list">
            {personalList.map((item) => (
              <ListItem
                key={item.id}
                itemId={item.id}
                itemValue={item.name}
                itemList={personalList}
                setList={setPersonalList}
                haveDepartment={true}
                itemDep={item.department}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddPersonalView;
