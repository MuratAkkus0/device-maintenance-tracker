import ItemCard from "./ItemCard";

function ItemList(props) {
  const { itemList, listTitle } = props;
  return (
    <div className="item__list">
      <div className="item__list--title">Room List </div>
      <div className=" item__list--list">
        {itemList.map((item) => (
          <ItemCard id={item.id} key={item.id} name={item.name} />
        ))}
      </div>
    </div>
  );
}

export default ItemList;
