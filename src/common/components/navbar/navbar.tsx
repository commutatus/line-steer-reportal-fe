import React from "react";
import { Avatar, Button, Dropdown, Layout, Space } from "antd";

const { Header } = Layout;
import { useGlobals } from "@/common/context/globals";
import { DownOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";

const ProfileDropdown = () => {
  const { auth, currentUser } = useGlobals();

  const profileDropdownItems = [
    {
      label: <span>{currentUser?.data?.email}</span>,
      key: "1",
    },
    {
      label: (
        <span>
          <LogoutOutlined /> Logout
        </span>
      ),
      danger: true,
      key: "2",
      onClick: () => {
        auth?.logout();
      },
    },
  ];

  return (
    <Dropdown menu={{ items: profileDropdownItems }} trigger={["click"]}>
      <Space
        size={4}
        align="center"
        className="p-[2px] pr-[8px] bg-neutral-fill-tertiary border border-solid border-gray-4 rounded-[40px] cursor-pointer"
      >
        <Avatar size={24} className="!bg-primary !text-white !text-[12px]">
          {currentUser?.data?.email?.[0]?.toUpperCase?.()}
        </Avatar>
        <DownOutlined className="w-[5.94px] h-[4px] !text-neutral align-middle" />
      </Space>
    </Dropdown>
  );
};

const Navbar = () => {
  const { toggleSidebarCollapse, isSidebarCollapsed } = useGlobals();

  return (
    <Header className="flex justify-between !leading-0 items-center sticky top-0 z-[1] !h-[40px] !px-[16px] !py-[8px] !bg-white border-solid border-0 border-b border-gray-3">
      <div className="inline-flex items-center gap-[8px]">
        {isSidebarCollapsed && (
          <Button
            type="text"
            onClick={() => toggleSidebarCollapse?.()}
            icon={<MenuOutlined className="!text-gray-6" />}
          />
        )}
      </div>
      <ProfileDropdown />
    </Header>
  );
};

export default Navbar;
