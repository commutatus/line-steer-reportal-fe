import React from "react";
import { Select, SelectProps } from "antd";

const CmSelect: React.FC<SelectProps> = (props) => {
  return <Select showSearch {...props} />;
};

export default CmSelect;
