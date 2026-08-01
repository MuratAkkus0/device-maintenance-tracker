import { useEffect, useState } from "react";
import FormPartInput from "./formParts/FormPartInput";
import { toast } from "react-toastify";

export default function AddPersonalForm({ personalList, setPersonalList }) {
  const [personId, setPersonId] = useState(generateId());
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    department: "",
  });

  const addedNotify = () => toast.success("Person successfuly added!");
  const notAddedNotify = () => toast.error("Adding a person failed!");

  useEffect(() => {
    let isUnique = true;
    personalList.forEach((person) => {
      if (person.id == personId) isUnique = false;
    });
    if (isUnique) {
      localStorage.setItem("personalList", JSON.stringify(personalList));
    } else {
      alert("This personal already exists.");
    }
  }, [personalList]);

  function generateId() {
    let id = Math.floor(Math.random() * 1000);
    let isUnique = !personalList.some((personal) => personal.id == id);
    if (isUnique) {
      return id;
    } else {
      generateId();
    }
  }
  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const person = {
      id: personId,
      ...formData,
    };
    let isUnique = !personalList.some((person) => person.id === personId);
    if (isUnique) {
      addedNotify();
      setPersonalList((prev) => [...prev, person]);
      setPersonId(generateId());
      setFormData({
        name: "",
        surname: "",
        department: "",
      });
    } else {
      notAddedNotify();
      alert("This personal already exists.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="add__form--container">
        <FormPartInput
          labelText="Id :"
          labelFor="id"
          inputValue={personId}
          isDisabled={true}
        />
        <FormPartInput
          onValueChange={handleInputChange}
          labelText="Name :"
          labelFor="name"
          inputValue={formData.name}
          isDisabled={false}
        />

        <FormPartInput
          onValueChange={handleInputChange}
          labelText="Surname :"
          labelFor="surname"
          inputValue={formData.surname}
          isDisabled={false}
        />
        <FormPartInput
          onValueChange={handleInputChange}
          labelText="Department :"
          labelFor="department"
          inputValue={formData.department}
          isDisabled={false}
        />
        <button className="btn">Add Person</button>
      </form>
    </>
  );
}
