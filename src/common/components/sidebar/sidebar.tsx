import Sider from "antd/es/layout/Sider";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Menu, MenuProps } from "antd";
import classNames from "classnames/bind";
import styles from "./sidebar.module.scss";
import { useGlobals } from "@/common/context/globals";
import useResponsive, { Breakpoints } from "@/common/hooks/useResponsive";
import Link from "next/link";
import { getMenuKeysFromPathname, MenuKeys, MENU_ROUTES } from "./sidebar.helpers";
import { useRouter } from "next/router";
import {
  CalendarOutlined,
  BarChartOutlined,
  DoubleLeftOutlined,
  FileTextOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { UserType } from "@/common/hooks/useCurrentUser";

const cx = classNames.bind(styles);

const SideBarHeader = (sidebarProps: {
  isSidebarCollapsed?: boolean;
  toggleSidebarCollapse?: () => void;
}) => {
  const { isSidebarCollapsed, toggleSidebarCollapse } = sidebarProps;
  return (
    <div
      className={cx(
        "flex items-center p-[8px] border-0 border-b border-solid border-gray-3",
        {
          "justify-between": !isSidebarCollapsed,
          "justify-center": isSidebarCollapsed,
        },
      )}
    >
      <div className="inline-flex items-center transition-all duration-300 overflow-hidden mx-auto">
        {isSidebarCollapsed && (
          <Image
            src="/assets/images/reportal-logo-short.png"
            alt="Logo"
            width={30}
            height={30}
          />
        )}

        {!isSidebarCollapsed && (
          <Image
            src="/assets/images/reportal-logo.png"
            alt="Logo"
            width={130}
            height={60}
          />
        )}
      </div>
      {!isSidebarCollapsed && (
        <Button
          type="text"
          icon={<DoubleLeftOutlined className="!text-gray-6 text-base" />}
          onClick={() => toggleSidebarCollapse?.()}
        />
      )}
    </div>
  );
};

const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebarCollapse, currentUser } = useGlobals();
  const { breakpoint } = useResponsive();
  const router = useRouter();

  const isSmallScreen = breakpoint <= Breakpoints.lg;

  const [selectedKey, setSelectedKey] = useState<string>("");
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const SIDEBAR_MENU_ITEMS: MenuProps["items"] = useMemo(() => {
    let firstItem = {
      key: MenuKeys.PLANNING,
      label: <Link href={MENU_ROUTES[MenuKeys.PLANNING]}>Planning</Link>,
      icon: <CalendarOutlined />,
    };

    if (currentUser?.userType === UserType.GENERATOR) {
      firstItem = {
        key: MenuKeys.REQUESTS,
        label: <Link href={MENU_ROUTES[MenuKeys.REQUESTS]}>Requests</Link>,
        icon: <UnorderedListOutlined />,
      };
    }

    return [
      firstItem,
      {
        key: MenuKeys.REPORTS,
        label: "Reports",
        icon: <BarChartOutlined />,
        children: [
          {
            key: MenuKeys.DAY_WISE_PLAN,
            label: <Link href={MENU_ROUTES[MenuKeys.DAY_WISE_PLAN]}>Day Wise Plan</Link>,
            icon: <CalendarOutlined />,
          },
          {
            key: MenuKeys.OVERALL_PLAN,
            label: <Link href={MENU_ROUTES[MenuKeys.OVERALL_PLAN]}>Overall Plan</Link>,
            icon: <FileTextOutlined />,
          },
          {
            key: MenuKeys.LOAD_GRAPH,
            label: <Link href={MENU_ROUTES[MenuKeys.LOAD_GRAPH]}>Load Graph</Link>,
            icon: <LineChartOutlined />,
          },
        ],
      },
    ].filter((item) => item !== null);
  }, [currentUser?.userType]);

  useEffect(() => {
    const { selectedKey, openKey } = getMenuKeysFromPathname(router.pathname);
    setSelectedKey(selectedKey);
    if (openKey) {
      setOpenKeys([openKey]);
    }
  }, [router.pathname]);

  return (
    <Sider
      theme={"light"}
      collapsible
      collapsed={isSidebarCollapsed}
      onCollapse={() => toggleSidebarCollapse?.()}
      className={cx("sidebar", "border-solid border-0 border-r border-gray-3")}
      width={219}
      trigger={null}
      collapsedWidth={isSmallScreen ? 0 : 56}
    >
      <SideBarHeader
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebarCollapse={toggleSidebarCollapse}
      />
      <Menu
        mode="inline"
        items={SIDEBAR_MENU_ITEMS}
        selectedKeys={[selectedKey]}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
      />
    </Sider>
  );
};

export default Sidebar;
