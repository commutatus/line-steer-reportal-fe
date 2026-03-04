import React from "react";
import { Avatar, Button, Dropdown, Layout, Space } from "antd";
import { useGlobals } from "@/common/context/globals";
import { DownOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";

const { Header } = Layout;

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
        className="p-[2px] pr-[8px] border border-solid border-gray-300 rounded-[40px] cursor-pointer"
      >
        <Avatar size={24} className="!bg-primary !text-white !text-[12px]">
          {currentUser?.data?.email?.[0]?.toUpperCase?.()}
        </Avatar>
        <DownOutlined className="w-[5.94px] h-[4px] !text-neutral align-middle" />
      </Space>
    </Dropdown>
  );
};

interface NavbarProps {
  pageTitle?: string;
  pageDescription?: string;
  navbarExtra?: React.ReactNode;
}

const Navbar = ({ pageTitle, pageDescription, navbarExtra }: NavbarProps) => {
  const { toggleSidebarCollapse, isSidebarCollapsed } = useGlobals();

  return (
    <Header className="flex justify-between leading-0! items-center sticky top-0 z-[1] min-h-[40px]! px-[16px]! py-[8px]! bg-white! border-solid border-0 border-b border-gray-3 h-auto!">
      <div className="inline-flex items-center gap-[8px]">
        <div>
          {isSidebarCollapsed && (
            <Button
              type="text"
              onClick={() => toggleSidebarCollapse?.()}
              icon={<MenuOutlined className="text-gray-6!" />}
            />
          )}
        </div>
        {(pageTitle || pageDescription) && (
          <div className="space-y-3!">
            <h6 className="font-semibold">
              {pageTitle}
            </h6>
            {pageDescription && <p className="text-sm text-gray-500">{pageDescription}</p>}
          </div>
        )}
      </div>
      <div className="inline-flex items-center gap-[8px]">
        {navbarExtra}
        <ProfileDropdown />
      </div>
    </Header>
  );
};

export default Navbar;
