import { useGlobals } from "@/common/context/globals";
import { DownOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps } from "antd";

const ParkSelector = () => {
  const { currentPark } = useGlobals();
  const { selectedPark, parks, selectPark } = currentPark ?? {};

  const parkMenuItems: MenuProps['items'] = (parks ?? []).map(park => ({
    key: park.id,
    icon: <EnvironmentOutlined />,
    label: (
      <div className="flex flex-col">
        <span>{park.name}</span>
        <span className="text-xs text-gray-500">{park.city}</span>
      </div>
    ),
  }));

  const handleParkMenuClick: MenuProps["onClick"] = (e) => {
    selectPark?.(e.key);
  };

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
