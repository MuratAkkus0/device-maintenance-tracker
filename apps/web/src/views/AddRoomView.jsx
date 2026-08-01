import { useEffect, useState } from "react";
import AddRoomForm from "../components/AddRoomForm";
import ItemList from "../components/ItemList";
import Navbar from "../components/Navbar";
import ListItem from "../components/ListItem";
import "../assets/css/ListItem.css";
import "../assets/css/ItemList.css";

function AddRoomView() {
  const [roomList, setRoomList] = useState(
    JSON.parse(localStorage.getItem("roomList")) || []
  );
  useEffect(() => {
    localStorage.setItem("roomList", JSON.stringify(roomList));
  }, [roomList]);

  return (
    <>
      <Navbar />
      <div className="add__room--container view__container">
        <AddRoomForm roomList={roomList} setRoomList={setRoomList} />
        <div className="item__list width95 mt1rem">
          <div className="item__list--title room__list--title">
            <span>Room Id</span>
            <span>Room Name</span>
            <span>Controls</span>
          </div>
          <div className=" item__list--list room__list">
            {roomList.map((item) => (
              <ListItem
                key={item.id}
                itemId={item.id}
                itemValue={item.name}
                itemList={roomList}
                setList={setRoomList}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddRoomView;
