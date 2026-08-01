import { useEffect, useRef, useState } from "react";
import "../assets/css/AddItemForm.css";
import FormPartInput from "./formParts/FormPartInput";
import FormPartSelect from "./formParts/FormPartSelect";
import FormPartDate from "./formParts/FormPartDate";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

function AddItemForm({
  item = {},
  isUpdate,
  onClosePopup,
  isReadOnly = false,
  deviceListProp,
  setDeviceListProp,
}) {
  const [deviceList, setDeviceList] = useState(
    deviceListProp || (JSON.parse(localStorage.getItem("devices")) ?? [])
  );
  const [personalList, setPersonalList] = useState(
    JSON.parse(localStorage.getItem("personalList")) ?? []
  );
  const [roomList, setRoomList] = useState(
    JSON.parse(localStorage.getItem("roomList")) ?? []
  );

  const [formStep, setFormStep] = useState(1);
  const [deviceTyp, setDeviceTyp] = useState(item.typ || "Laptop");
  const [deviceId, setDeviceId] = useState(item.id || generateDeviceId());
  const [deviceCarePeriod, setDeviceCarePeriod] = useState(
    item.carePeriod || ""
  );
  const [deviceTechnicerEmail, setDeviceTechnicerEmail] = useState(
    item.technicerEmail || ""
  );
  const [deviceLocation, setDeviceLocation] = useState(
    item.ownerId || item.roomId || ""
  );
  const [deviceMAC, setDeviceMAC] = useState(item.MAC || "");
  const [devicePurchaseDate, setDevicePurchaseDate] = useState(
    item.purchaseDate || ""
  );
  const [deviceLastCareDate, setDeviceLastCareDate] = useState(
    item.lastCareDate || ""
  );
  const [readOnly, setReadOnly] = useState(isReadOnly);

  const [isLastStep, setIsLastStep] = useState(false);

  const newDevice = useRef({});
  const totalFormSteps = 6;

  const carePeriods = [1, 3, 6, 12, 24, 36];

  const addedNotify = () => toast.success("Item successfuly added !");
  const updatedNotify = () => toast.success("Item successfuly updated !");

  useEffect(() => {
    if (isReadOnly) {
      setFormStep(totalFormSteps);
    }
  }, [isReadOnly]);

  // Generate a unique device ID
  function generateDeviceId() {
    let id;
    do {
      id = Math.floor(Math.random() * 1000);
    } while (deviceList.some((device) => device.id === id));
    return id;
  }

  // Update the step and check if it's the last one
  useEffect(() => {
    setIsLastStep(formStep === totalFormSteps);
  }, [formStep]);

  const handleStepChange = () => {
    if (formStep < totalFormSteps) setFormStep(formStep + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLastStep) {
      const form = e.target;
      console.log(form.location.value);

      const lastCareDate =
        new Date(deviceLastCareDate) >= new Date(devicePurchaseDate)
          ? deviceLastCareDate
          : devicePurchaseDate;

      newDevice.current = {
        id: deviceId,
        name: `${deviceTyp.split(" ")[0]}-${deviceId}`,
        typ: deviceTyp,
        carePeriod: form.carePeriod.value,
        technicerEmail: deviceTechnicerEmail,
        purchaseDate: devicePurchaseDate,
        MAC: deviceMAC || "",

        [deviceTyp === "Laptop" ? "ownerId" : "roomId"]: form.location.value,

        lastCareDate: lastCareDate,
        createDate: new Date().toISOString().split("T")[0],

        nextCareDate: calculateNextCareDate(
          lastCareDate,
          form.carePeriod.value
        ),
      };
      console.log("ok");
      addedNotify();
      saveDevice(newDevice.current);
      //reset form
      form.reset();
      setDeviceId(generateDeviceId());
      setFormStep(1);
      setIsLastStep(false);
    }
  };
  const calculateNextCareDate = (lastCareDate, carePeriod) => {
    const calculatedDate = new Date(
      new Date(lastCareDate).setMonth(
        new Date(lastCareDate).getMonth() + parseInt(carePeriod, 10)
      )
    );

    // if calculated date smaller then today then return todays date
    const today = new Date();
    const nextCareDate = calculatedDate >= today ? calculatedDate : today;

    return nextCareDate.toISOString().split("T")[0];
  };
  const saveDevice = (device) => {
    const updatedDeviceList = [...deviceList, device];
    setDeviceList(updatedDeviceList);
    localStorage.setItem("devices", JSON.stringify(updatedDeviceList));
  };

  const updateItemInLS = (updatedDevice) => {
    console.log(updatedDevice);
    const updatedDeviceList = [...deviceList].map((device) =>
      device.id === updatedDevice.id ? updatedDevice : device
    );
    updatedNotify();
    setDeviceListProp([...updatedDeviceList]);
    setDeviceList([...updatedDeviceList]);
    setReadOnly(true);
  };
  useEffect(() => {
    localStorage.setItem("devices", JSON.stringify(deviceList));
  }, [deviceListProp]);

  const updateItem = (e) => {
    e.preventDefault();

    const form = e.target;
    const lastCareDate =
      new Date(deviceLastCareDate) >= new Date(devicePurchaseDate)
        ? deviceLastCareDate
        : devicePurchaseDate;

    const updatedDevice = {
      ...item,
      name: `${deviceTyp.split(" ")[0]}-${deviceId}`,
      typ: deviceTyp,
      carePeriod: form.carePeriod.value,
      technicerEmail: deviceTechnicerEmail,
      purchaseDate: devicePurchaseDate,
      MAC: deviceMAC || "",
      [deviceTyp === "Laptop" ? "ownerId" : "roomId"]: form.location.value,
      lastCareDate: lastCareDate,
      nextCareDate: calculateNextCareDate(lastCareDate, form.carePeriod.value),
    };

    updateItemInLS(updatedDevice);
  };
  return (
    <>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={isUpdate ? updateItem : handleSubmit}
        className="add__form--container"
        id="addItem"
      >
        {isUpdate && (
          <a className="close-popup">
            <span onClick={onClosePopup} className="close-ico">
              X
            </span>
          </a>
        )}
        <FormPartInput
          labelText="Gerät Id:"
          labelFor="deviceId"
          inputValue={deviceId}
          isDisabled={true}
        />
        <FormPartSelect
          selectValue={deviceTyp}
          onValueChange={(e) => setDeviceTyp(e.target.value)}
          labelText="Gerät Typ:"
          labelFor="deviceType"
          optionList={["Laptop", "Desktop Computer"]}
          isDisabled={readOnly}
        />
        {formStep >= 2 && (
          <>
            <FormPartSelect
              labelText={deviceTyp === "Laptop" ? "Gerätebesitzer:" : "Raum:"}
              labelFor="location"
              optionList={deviceTyp === "Laptop" ? personalList : roomList}
              selectValue={deviceLocation}
              onValueChange={(e) => setDeviceLocation(e.target.value)}
              isDisabled={readOnly}
            />
          </>
        )}
        {formStep >= 3 && (
          <>
            <FormPartSelect
              labelText="Wartungsperiode:"
              labelFor="carePeriod"
              optionList={carePeriods}
              optionalTextFirst="jeder"
              optionalTextLast="Monat"
              selectValue={deviceCarePeriod}
              onValueChange={(e) => setDeviceCarePeriod(e.target.value)}
              isDisabled={readOnly}
            />
            <FormPartInput
              labelText="Technikers Email:"
              labelFor="technicerEmail"
              inputValue={deviceTechnicerEmail}
              onValueChange={(e) => setDeviceTechnicerEmail(e.target.value)}
              isDisabled={readOnly}
              isRequired={true}
              inputType="email"
            />
          </>
        )}
        {formStep >= 4 && (
          <FormPartInput
            labelText="Gerät Mac Adresse (optional):"
            labelFor="deviceMAC"
            placeHolder="etc. 00:00:5e:00:53:af"
            inputPattern="^([0-9A-Fa-f]{2}([-:])){5}([0-9A-Fa-f]{2})$"
            inputValue={deviceMAC}
            onValueChange={(e) => setDeviceMAC(e.target.value)}
            isDisabled={readOnly}
          />
        )}
        {formStep >= 5 && (
          <FormPartDate
            labelText="Kaufdatum:"
            labelFor="purchaseDate"
            isRequired={true}
            dateValue={devicePurchaseDate}
            onValueChange={(e) => setDevicePurchaseDate(e.target.value)}
            isDisabled={readOnly}
          />
        )}
        {formStep >= 6 && (
          <FormPartDate
            labelText="Last Care Date (optional):"
            labelFor="lastCareDate"
            dateValue={deviceLastCareDate}
            onValueChange={(e) => setDeviceLastCareDate(e.target.value)}
            isDisabled={readOnly}
          />
        )}
        {!readOnly ? (
          <button
            onClick={handleStepChange}
            type={isLastStep ? "submit" : "button"}
            className="btn"
          >
            {isLastStep ? (isUpdate ? "Update Item" : "Add Item") : "Next"}
          </button>
        ) : (
          <a onClick={() => setReadOnly(!readOnly)} className="btn">
            Edit Item
          </a>
        )}
      </form>
    </>
  );
}

export default AddItemForm;
