import { DownOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const plants = [
  {
    id: "1",
    name: "Awesome Steel Plant",
    location: "Hoskote"
  },
  {
    id: "2",
    name: "Less Awesome Steel Plant",
    location: "Hoskote"
  },
];

const plantMenuItems: MenuProps['items'] = [
  ...plants.map(plant => ({
    key: plant.id,
    icon: <EnvironmentOutlined />,
    label: (
      <div className="flex flex-col">
        <span>{plant.name}</span>
        <span className="text-xs text-gray-500">{plant.location}</span>
      </div>
    ),
  })),
];

const PlantSelector = () => {
  const [selectedPlant, setSelectedPlant] = useState<{ id: string; name: string; location: string; } | null>(plants[0]);
  const router = useRouter();

  const handlePlantMenuClick: MenuProps["onClick"] = (e) => {
    setSelectedPlant(plants.find(plant => plant.id === e?.key) ?? null);
    router.push({
      pathname: "/consumer",
      query: {
        plantId: e?.key,
      }
    })
  };

  useEffect(() => {
    const plantId = router.query.plantId as string;
    setSelectedPlant(plants.find(plant => plant.id === plantId) ?? plants[0]);
  }, [router.query.plantId]);

  return (
    <Dropdown
      menu={{ items: plantMenuItems, onClick: handlePlantMenuClick }}
      trigger={['click']}
    >
      <Button icon={<EnvironmentOutlined />}>
        {selectedPlant?.name || 'Select Plant'} <DownOutlined />
      </Button>
    </Dropdown>
  );
}

export default PlantSelector;
