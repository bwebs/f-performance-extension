import {
  Box,
  Card,
  CodeBlock,
  Header,
  IconButton,
  InputColor,
  List,
  Select,
  Span,
} from "@looker/components";
import { Check } from "@styled-icons/material/Check";
import React, { useState } from "react";
import Balancer from "react-wrap-balancer";
import { useAppContext } from "./AppContext";
import ColorRow from "./ColorRow";
import Settings from "./Settings";

interface Driver {
  id: string;
  name: string;
  color: string;
}

const defaultDrivers: Driver[] = [
  { id: "1", name: "Kyle Larson", color: "#FF0000" },
  { id: "2", name: "Chase Elliott", color: "#0000FF" },
  { id: "3", name: "Denny Hamlin", color: "#FFD700" },
  { id: "4", name: "Joey Logano", color: "#00FF00" },
];

const Sidebar: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>(defaultDrivers);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const { dashboard_options, applyColorChange } = useAppContext();

  const handleColorChange = (driverId: string, newColor: string) => {
    setDrivers(
      drivers.map((driver) =>
        driver.id === driverId ? { ...driver, color: newColor } : driver
      )
    );
  };

  return (
    <Card
      raised
      position="relative"
      backgroundColor="#B7C9E2"
      p="xsmall"
      borderRadius="large"
    >
      <Header>
        <Span p="xsmall" fontSize="xlarge">
          <Balancer>NASCAR Driver Selection</Balancer>
        </Span>
      </Header>

      <Box p="medium">
        <Select
          value={selectedDriver}
          onChange={setSelectedDriver}
          options={drivers.map((driver) => ({
            value: driver.id,
            label: driver.name,
          }))}
          placeholder="Select a driver"
        />

        {selectedDriver && (
          <Box mt="medium">
            <Span>Driver Color:</Span>
            <InputColor
              hideInput
              value={
                drivers.find((d) => d.id === selectedDriver)?.color || "#000000"
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleColorChange(selectedDriver, e.target.value)
              }
            />
            <IconButton
              icon={<Check />}
              label="Apply color"
              onClick={() => {
                // Add any additional logic here if needed
                console.log("Color applied");
              }}
            />
          </Box>
        )}
      </Box>
      <List>
        <ColorRow
          field={"users.traffic_source"}
          value={"Email"}
          onSave={(field, value) => {
            applyColorChange(field, value);
          }}
        />
      </List>
      <CodeBlock fontSize="xxsmall">
        {JSON.stringify(dashboard_options, null, 2)}
      </CodeBlock>

      <Box flexGrow={1} />
      <Settings />
    </Card>
  );
};

export default Sidebar;
