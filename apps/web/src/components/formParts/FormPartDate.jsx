function FormPartDate(props) {
  const {
    labelFor,
    labelText,
    isRequired = false,
    dateValue,
    onValueChange,
    isDisabled = false,
  } = props;
  return (
    <>
      <div className="form__part">
        <label className="labels" htmlFor={labelFor}>
          {labelText}
        </label>
        <input
          onChange={onValueChange}
          type="date"
          name={labelFor}
          id={labelFor}
          required={isRequired}
          max={new Date().toJSON().slice(0, 10)}
          value={dateValue ?? ""}
          disabled={isDisabled}
        />
      </div>
    </>
  );
}

export default FormPartDate;
