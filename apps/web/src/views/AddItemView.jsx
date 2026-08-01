import AddItemForm from "../components/AddItemForm";
import Navbar from "../components/Navbar";

function AddItemView() {
  return (
    <>
      <Navbar />
      <div className="add__item--container view__container">
        <AddItemForm />
      </div>
    </>
  );
}

export default AddItemView;
