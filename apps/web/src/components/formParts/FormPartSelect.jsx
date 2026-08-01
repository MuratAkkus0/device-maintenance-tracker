function FormPartSelect(props) {
  const {
    labelFor,
    labelText,
    optionList = [],
    optionalTextFirst = "",
    optionalTextLast = "",
    selectValue,
    onValueChange,
    optionValue,
    isDisabled,
  } = props;
  return (
    <div className="form__part">
      <label className="labels" htmlFor={labelFor}>
        {labelText}
      </label>
      <select
        onChange={onValueChange}
        name={labelFor}
        id={labelFor}
        value={selectValue}
        disabled={isDisabled}
        required
      >
        {optionList &&
          optionList.map((item, index) => {
            return (
              <option key={index} value={item.id ?? item}>
                {optionalTextFirst}{" "}
                {item.name ? `${item.name} ${item.surname ?? ""}` : item}{" "}
                {optionalTextLast}
              </option>
            );
          })}
      </select>
    </div>
  );
}

export default FormPartSelect;
