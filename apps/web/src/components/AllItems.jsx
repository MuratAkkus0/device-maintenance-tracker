import ItemCard from "./ItemCard";
import "../assets/css/ItemList.css";
import { useState } from "react";

function AllItems({
  deviceList,
  limit,
  onClickItem,
  personalList,
  roomList,
  setDeviceList,
}) {
  const [showMore, setShowMore] = useState(true);

  return (
    <>
      <div className="overview__items--all item__list">
        <div className="item__list--title">Alle Geräte: </div>
        <div className="all__items--items item__list--list">
          {deviceList.length ? (
            deviceList
              .slice(
                0,
                showMore ? limit ?? deviceList.length : deviceList.length
              )
              .map((item) =>
                item.typ == "Laptop" ? (
                  <ItemCard
                    id={item.id}
                    onClickItem={onClickItem}
                    key={item.id}
                    name={item.name}
                    location={`${
                      personalList.filter(
                        (person) => person.id == item.ownerId
                      )[0].name
                    } ${
                      personalList.filter(
                        (person) => person.id == item.ownerId
                      )[0].surname
                    }`}
                    nextCareDate={item.nextCareDate}
                    typ={item.typ}
                    setDeviceList={setDeviceList}
                    technicerEmail={item.technicerEmail}
                  />
                ) : (
                  <ItemCard
                    id={item.id}
                    onClickItem={onClickItem}
                    key={item.id}
                    name={item.name}
                    location={
                      roomList.filter((room) => room.id == item.roomId)[0].name
                    }
                    nextCareDate={item.nextCareDate}
                    typ={item.typ}
                    setDeviceList={setDeviceList}
                    technicerEmail={item.technicerEmail}
                  />
                )
              )
          ) : (
            <p className="no-item">No Item</p>
          )}
        </div>
        {limit && deviceList.length > limit ? (
          <div className="show__more--btn">
            <a onClick={() => setShowMore(!showMore)} className="btn a__link">
              {showMore ? "Show More" : "Show Less"}
            </a>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
}

export default AllItems;
