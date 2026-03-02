import React from "react";
import { Drawer, Tag, Table, Descriptions } from "antd";
import dayjs from "dayjs";
import { LoadSchedule } from "@/modules/generator/generator.types";
import { fillConfig } from "@/modules/consumer/consumer-utils";
import { LoadScheduleDayStatusEnum } from "@/generated/graphql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { convertToUTCHoursFormat } from "@/common/utils/helpers";

interface RequestDetailsSheetProps {
  request: LoadSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RequestDetailsSheet: React.FC<RequestDetailsSheetProps> = ({
  request,
  open,
  onOpenChange,
}) => {
  if (!request) {
    return null;
  }

  const formattedDate = dayjs(request.date).format("MMMM D, YYYY");

  const columns = [
    {
      title: "Time",
      dataIndex: "startTime",
      key: "time",
      width: 100,
      render: (time: string) => (
        <span className="font-mono text-sm">
          {convertToUTCHoursFormat(time)}
        </span>
      ),
    },
    {
      title: "Load (MW)",
      dataIndex: "load",
      key: "load",
      align: "right" as const,
      render: (mw: number | null) => (
        <span className="font-mono">{mw?.toFixed(2) ?? "—"}</span>
      ),
    },
  ];

  const statusConfig = fillConfig[request.status ?? LoadScheduleDayStatusEnum.InProgress];

  return (
    <Drawer
      title="Request Details"
      open={open}
      onClose={() => onOpenChange(false)}
      size={500}
    >
      <Descriptions column={1} bordered size="small" className="mb-6!">
        <Descriptions.Item label="Plant">
          {request.park?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Location">
          {request.park?.city ?? "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Date">{formattedDate}</Descriptions.Item>
        <Descriptions.Item label="Total Load">
          <span className="font-semibold text-blue-600">
            {request.totalLoad.toFixed(2)} MW
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag
            color={statusConfig.color}
          >
            <FontAwesomeIcon icon={statusConfig.icon} className="mr-2" />
            {statusConfig.label}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <h4 className="text-sm font-medium mb-3!">Time Slots (96 slots)</h4>
      <Table
        dataSource={request.loadSchedules?.map((slot, i) => ({ ...slot, key: i }))}
        columns={columns}
        pagination={false}
        size="small"
        scroll={{ y: "calc(100vh - 400px)" }}
      />
    </Drawer>
  );
};

export default RequestDetailsSheet;
