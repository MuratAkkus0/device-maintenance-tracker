import ItemCard from "./ItemCard";
import "../assets/css/ItemList.css";
import { useState } from "react";

export default function TimePressedItems({
  deviceList,
  personalList,
  roomList,
  limit,
  onClickItem,
  setDeviceList,
  allDevicesList,
}) {
  const [showMore, setShowMore] = useState(true);
  console.log(limit && deviceList.length > limit);
  return (
    <>
      <div className="overview__items--time-pressed item__list">
        <div className="item__list--title">Service Wartung nähert sich: </div>
        <div className="time__pressed--items item__list--list">
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
                    deviceList={allDevicesList}
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
