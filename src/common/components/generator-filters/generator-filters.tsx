import { useGlobals } from "@/common/context/globals";
import { Flex, Select } from "antd";
import { useMemo } from "react";

const GeneratorFilters = () => {
  const { currentPark } = useGlobals();
  const { parks, factories, parkId, factoryId, selectPark, selectFactory } = currentPark ?? {};

  const parkOptions = useMemo(
    () => (parks ?? []).map((park) => ({ value: park.id, label: park.name ?? "" })),
    [parks]
  );

  const factoryOptions = useMemo(
    () => (factories ?? []).map((factory) => ({ value: factory.id, label: factory.name ?? "" })),
    [factories]
  );

  const handleParkChange = (value: string) => {
    selectPark?.(value);
  };

  const handleFactoryChange = (value: string) => {
    selectFactory?.(value ?? null);
  };

  return (
    <Flex gap={8} align="center">
      <span className="text-sm text-slate-600">Park:</span>
      <Select
        placeholder="Select a Park"
        options={parkOptions}
        value={parkId}
        onChange={handleParkChange}
        className="w-[180px]"
      />
      <span className="text-sm text-slate-600">Factory:</span>
      <Select
        placeholder="Select a Factory"
        options={factoryOptions}
        value={factoryId}
        onChange={handleFactoryChange}
        allowClear
        disabled={!parkId}
        className="w-[180px]"
      />
    </Flex>
  );
}

export default GeneratorFilters;
