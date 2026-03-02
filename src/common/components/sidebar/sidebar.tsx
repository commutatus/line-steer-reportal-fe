import Sider from "antd/es/layout/Sider";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Menu, MenuProps } from "antd";
import classNames from "classnames/bind";
import styles from "./sidebar.module.scss";
import { useGlobals } from "@/common/context/globals";
import useResponsive from "@/common/hooks/useResponsive";
import Link from "next/link";
import { getMenuKeysFromPathname, MenuKeys } from "./sidebar.helpers";
import { useRouter } from "next/router";
import {
  CalendarOutlined,
  BarChartOutlined,
  DoubleLeftOutlined,
  FileTextOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import Image from "next/image";

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
  const { isSidebarCollapsed, toggleSidebarCollapse } = useGlobals();
  const { isMobile } = useResponsive();
  const router = useRouter();

  const isSmallScreen = isMobile;

  const [selectedKey, setSelectedKey] = useState<string>("");
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const SIDEBAR_MENU_ITEMS: MenuProps["items"] = useMemo(() => {
    const planningHref = "/consumer";
    const dayWisePlanHref = "/reports/day-wise-plan";
    const overallPlanHref = "/reports/overall-plan";
    const loadGraphHref = "/reports/load-graph";

    return [
      {
        key: MenuKeys.PLANNING,
        label: <Link href={planningHref}>Planning</Link>,
        icon: <CalendarOutlined />,
      },
      {
        key: MenuKeys.REPORTS,
        label: "Reports",
        icon: <BarChartOutlined />,
        children: [
          {
            key: MenuKeys.DAY_WISE_PLAN,
            label: <Link href={dayWisePlanHref}>Day Wise Plan</Link>,
            icon: <CalendarOutlined />,
          },
          {
            key: MenuKeys.OVERALL_PLAN,
            label: <Link href={overallPlanHref}>Overall Plan</Link>,
            icon: <FileTextOutlined />,
          },
          {
            key: MenuKeys.LOAD_GRAPH,
            label: <Link href={loadGraphHref}>Load Graph</Link>,
            icon: <LineChartOutlined />,
          },
        ],
      },
    ].filter((item) => item !== null);
  }, []);

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
