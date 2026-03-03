import React, { useMemo, useState } from "react";
import RootLayout from "@/common/layouts/root-layout";
import { Row, Col, Card, Statistic, Table, Tag } from "antd";
import dayjs from "dayjs";
import RequestDetailsSheet from "./components/RequestDetailsSheet";
import { useQuery } from "@apollo/client";
import { GET_LOAD_SCHEDULED_DAYS } from "@/common/graphql/consumer.graphql";
import { GetLoadScheduleDaysQuery, GetLoadScheduleDaysQueryVariables, LoadScheduleDaySortColumn, LoadScheduleDayStatusEnum, SortDirection } from "@/generated/graphql";
import { fillConfig } from "../consumer/consumer-utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadSchedule } from "./generator.types";
import GeneratorFilters from "@/common/components/generator-filters";

const presentDate = dayjs();

const Generator = () => {
  const [selectedRequest, setSelectedRequest] = useState<LoadSchedule | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data } = useQuery<GetLoadScheduleDaysQuery, GetLoadScheduleDaysQueryVariables>(GET_LOAD_SCHEDULED_DAYS, {
    variables: {
      filters: {
        dateRange: {
          from: presentDate.startOf("month").toISOString(),
          to: presentDate.endOf("month").toISOString(),
        }
      },
      sort: {
        column: LoadScheduleDaySortColumn.Date,
        direction: SortDirection.Asc,
      }
    }
  });

  const loadScheduledDays = useMemo(() => data?.loadScheduleDays?.data || [], [data]);

  const totalCount = loadScheduledDays.length;
  const plannedCount = useMemo(
    () => loadScheduledDays.filter((r) => r.status === LoadScheduleDayStatusEnum.Ready).length,
    [loadScheduledDays],
  );

  const handleRowClick = (record: LoadSchedule) => {
    setSelectedRequest(record);
    setSheetOpen(true);
  };

  const columns = [
    {
      title: "Plant",
      dataIndex: ["park", "name"],
      key: "plantName",
      render: (plantName: string, record: LoadSchedule) => (
        <div>
          <p>{plantName}</p>
          <p className="text-sm text-gray-500">
            {record.park?.city}
          </p>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Total Load (MW)",
      dataIndex: "totalLoad",
      key: "totalLoad",
      align: "right" as const,
      render: (val: number) => val.toFixed(2),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: LoadScheduleDayStatusEnum) => {
        const config = fillConfig[status];
        return (
          <Tag color={config.color}>
            <FontAwesomeIcon icon={config.icon} className="mr-2" />
            {config.label}
          </Tag>
        )
      },
    },
  ];

  return (
    <RootLayout pageTitle="Requests" navbarExtra={<GeneratorFilters />}>
      <div className="p-6">
        <Row gutter={16} className="mb-6">
          <Col span={12}>
            <Card>
              <Statistic title="Total Requests" value={totalCount} />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Planned"
                value={plannedCount}
                styles={{
                  content: { color: "#3b82f6" }
                }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="All Requests">
          <Table
            dataSource={loadScheduledDays}
            columns={columns}
            pagination={false}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              className: "cursor-pointer"
            })}
            locale={{ emptyText: "No requests found" }}
          />
        </Card>
      </div>

      <RequestDetailsSheet
        request={selectedRequest}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </RootLayout>
  );
};

export default Generator;
