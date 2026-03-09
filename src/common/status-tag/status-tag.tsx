import { Tag } from "antd";
import { fillConfig } from "../constants/plan-status";
import { PlanStatus } from "../constants/plan-status";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const StatusTag = ({ status, onClick }: { status: PlanStatus; onClick?: () => void }) => {
  const config = fillConfig[status];
  if (!config) {
    return <span className="text-gray-400">—</span>;
  }
  return (
    <Tag
      color={config.color}
      className={classNames("cursor-pointer", config.bgClass)}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={config.icon} className="mr-1" /> {config.label}
    </Tag>
  );
}

export default StatusTag;
