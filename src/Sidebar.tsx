import {
  Box,
  Card,
  CodeBlock,
  Header,
  InputColor,
  Select,
  Span,
} from "@looker/components";
import React, { useState } from "react";
import Balancer from "react-wrap-balancer";
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
              value={
                drivers.find((d) => d.id === selectedDriver)?.color || "#000000"
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleColorChange(selectedDriver, e.target.value)
              }
            />
          </Box>
        )}
      </Box>

      <CodeBlock fontSize="xxsmall">
        {JSON.stringify(drivers, null, 2)}
      </CodeBlock>

      <Box flexGrow={1} />
      <Settings />
    </Card>
  );
};

export default Sidebar;
