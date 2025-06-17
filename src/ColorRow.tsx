import {
  FieldColor,
  InputText,
  ListItem,
  Space,
  Span,
} from "@looker/components";
import React from "react";
import styled from "styled-components";

const StyledFieldColor = styled(FieldColor)`
  & > div > div > div > input {
    display: none;
  }
`;

interface ColorRowProps {
  field: string;
  value: string;
  onSave: (field: string, value: string) => void;
}

const ColorRow: React.FC<ColorRowProps> = ({ field, value, onSave }) => {
  return (
    <ListItem itemRole={"none"} ripple={false}>
      <Span>users.traffic_source</Span>
      <Space>
        <InputText label={"Value"} defaultValue={value} />
        <StyledFieldColor
          defaultValue={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onSave(value, e.target.value);
          }}
        />
      </Space>
    </ListItem>
  );
};

export default ColorRow;
