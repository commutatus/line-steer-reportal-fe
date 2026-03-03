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

const ParkSelector = () => {
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const router = useRouter();
  const { data: contractsData } = useQuery<GetContractsQuery, GetContractsQueryVariables>(GET_CONTRACTS);
  const contracts = useMemo(() => contractsData?.contracts?.data ?? [], [contractsData]);

  const parks = useMemo(() => contracts.map(contract => ({
    id: contract.park?.id,
    name: contract.park?.name,
    location: contract.park?.city,
  })), [contracts]);

  const parkMenuItems: MenuProps['items'] = [
    ...parks.map(park => ({
      key: park.id ?? "",
      icon: <EnvironmentOutlined />,
      label: (
        <div className="flex flex-col">
          <span>{park.name}</span>
          <span className="text-xs text-gray-500">{park.location}</span>
        </div>
      ),
    })),
  ];

  const handleParkMenuClick: MenuProps["onClick"] = (e) => {
    setSelectedPark(parks.find(park => park.id === e?.key) ?? null);
    router.push({
      pathname: "/consumer",
      query: {
        parkId: e?.key,
      }
    })
  };

  useEffect(() => {
    const parkId = typeof router.query.parkId === "string" ? router.query.parkId : null;
    setSelectedPark(parks.find(park => park.id === parkId) ?? parks?.[0]);
  }, [router.query.parkId, parks]);

  return (
    <Dropdown
      menu={{ items: parkMenuItems, onClick: handleParkMenuClick }}
      trigger={['click']}
    >
      <Button icon={<EnvironmentOutlined />}>
        {selectedPark?.name || 'Select Park'} <DownOutlined />
      </Button>
    </Dropdown>
  );
}

export default ParkSelector;
