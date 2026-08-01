import { useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
const deletedNotify = () => toast.success("Item deleted successfuly!!");
const notDeletedNotify = () =>
  toast.error(
    "Deleting an item failed! This item cannot be deleted. Please delete first items that use this item."
  );

function ListItem(props) {
  const {
    itemId,
    itemValue,
    itemDep,
    haveDepartment = false,
    setList,
    itemList,
  } = props;
  const [deviceList, setDeviceList] = useState(
    JSON.parse(localStorage.getItem("devices")) || []
  );
  const onDelItem = (e) => {
    let canDelete = !deviceList.some(
      (item) => (haveDepartment ? item.ownerId : item.roomId) == itemId
    );
    console.log(canDelete);
    if (canDelete) {
      let newList = [...itemList.filter((item) => item.id !== itemId)];
      setList([...newList]);
      deletedNotify();
    } else {
      notDeletedNotify();
    }
  };
  return (
    <>
      <div className="list__item--container">
        <div className="list__item--id">{itemId}</div>
        <div className="list__item--value">{itemValue}</div>
        {haveDepartment ? <div className="list__item--dep">{itemDep}</div> : ""}
        <div className="list__item--controls">
          <MdDeleteForever className="del__icon" onClick={onDelItem} />
        </div>
      </div>
    </>
  );
}

export default ListItem;
