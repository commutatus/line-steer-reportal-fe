import { GET_CONTRACTS } from "@/common/graphql/constants";
import { GetContractsQuery, GetContractsQueryVariables } from "@/generated/graphql";
import { DownOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { Button, Dropdown, MenuProps } from "antd";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type Park = {
  id?: string | null;
  name?: string | null;
  city?: string | null;
}

const PlantSelector = () => {
  const [selectedPlant, setSelectedPlant] = useState<Park | null>(null);
  const router = useRouter();
  const { data: contractsData } = useQuery<GetContractsQuery, GetContractsQueryVariables>(GET_CONTRACTS);
  const contracts = useMemo(() => contractsData?.contracts?.data ?? [], [contractsData]);

  const parks = useMemo(() => contracts.map(contract => ({
    id: contract.park?.id,
    name: contract.park?.name,
    location: contract.park?.city,
  })), [contracts]);

  const plantMenuItems: MenuProps['items'] = [
    ...parks.map(plant => ({
      key: plant.id ?? "",
      icon: <EnvironmentOutlined />,
      label: (
        <div className="flex flex-col">
          <span>{plant.name}</span>
          <span className="text-xs text-gray-500">{plant.location}</span>
        </div>
      ),
    })),
  ];

  const handlePlantMenuClick: MenuProps["onClick"] = (e) => {
    setSelectedPlant(parks.find(park => park.id === e?.key) ?? null);
    router.push({
      pathname: "/consumer",
      query: {
        plantId: e?.key,
      }
    })
  };

  useEffect(() => {
    const plantId = router.query.plantId as string;
    setSelectedPlant(parks.find(plant => plant.id === plantId) ?? parks?.[0]);
  }, [router.query.plantId, parks]);

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
