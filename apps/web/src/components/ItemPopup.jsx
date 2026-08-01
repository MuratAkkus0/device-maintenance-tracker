import { useState } from "react";
import "../assets/css/ItemPopup.css";
import ItemCard from "./ItemCard";
import AddItemForm from "./AddItemForm";
function ItemPopup(props) {
  const { item, deviceList, setDeviceList, onClosePopup } = props;

  return (
    <>
      <div className="item__popup--container">
        <AddItemForm
          item={item}
          isUpdate={true}
          onClosePopup={onClosePopup}
          isReadOnly={true}
          deviceListProp={deviceList}
          setDeviceListProp={setDeviceList}
        />
      </div>
    </>
  );
}

export default ItemPopup;
