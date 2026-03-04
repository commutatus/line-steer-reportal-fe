import React, { useState } from 'react';
import { Timeline, Typography, Button, Tag } from 'antd';
import { ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { GET_CONTRACT_LOGS } from '@/common/graphql/consumer.graphql';
import { useGlobals } from '@/common/context/globals';
import { GetContractLogsQuery, GetContractLogsQueryVariables } from '@/generated/graphql';
import { convertToUTCHoursFormat } from '@/common/utils/helpers';
import PageLoader from '@/common/components-ui/page-loader/page-loader';
import dayjs from 'dayjs';

const { Text } = Typography;

interface AuditChange {
  load?: {
    from: number | null;
    to: number | null;
  },
  start_time: string;
  end_time: string;
  esclation: boolean;
}

const CHANGES_PREVIEW_COUNT = 5;

const ChangesList: React.FC<{ changes: AuditChange[] }> = ({ changes }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded
    ? changes
    : changes.slice(0, CHANGES_PREVIEW_COUNT);
  const hasMore = changes.length > CHANGES_PREVIEW_COUNT;

  return (
    <div className="mt-1.5 space-y-0.5">
      {visible.map((c, i) => (
        <div key={i} className="text-xs flex items-center gap-1.5">
          <Text code className="text-[11px]!">
            {convertToUTCHoursFormat(c.start_time)}
          </Text>
          <Text type="secondary" className="text-sm!">{c.load?.from ?? '—'}</Text>
          <span>→</span>
          <Text strong className="text-sm!">{c.load?.to ?? '—'}</Text>
          <Text type="secondary" className="text-sm!">MW</Text>
        </div>
      ))}
      {hasMore && (
        <Button
          type="link"
          size="small"
          className="p-0! h-auto! text-xs!"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? 'Show less'
            : `Show ${changes.length - CHANGES_PREVIEW_COUNT} more changes`}
        </Button>
      )}
    </div>
  );
};

const AuditHistoryTab = () => {
  const { currentPark } = useGlobals();
  const { contractId } = currentPark ?? {};
  const { data, loading: isContractLogsLoading } = useQuery<GetContractLogsQuery, GetContractLogsQueryVariables>(GET_CONTRACT_LOGS, {
    variables: {
      contractId: contractId ?? '',
    },
    skip: !contractId,
  })
  const contractLogs = data?.contractLogs?.logs ?? [];

  const timelineItems = contractLogs.map((entry, index) => {
    const timeStr = dayjs(entry.timeOfChange).format('DD MMM YYYY hh:mm A');
    const pastCutoff = entry.changes.some((c) => c.esclation);

    return {
      key: index,
      color: pastCutoff ? ('red' as const) : ('blue' as const),
      dot: <EditOutlined />,
      children: (
        <div className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Text strong className="text-sm!">
              {entry.fullName}
            </Text>
            <Text type="secondary" className="text-xs!">
              ({entry.email})
            </Text>
            <Text type="secondary" className="text-xs!">
              <ClockCircleOutlined className="mr-1" />
              {timeStr}
            </Text>
            {pastCutoff && (
              <Tag
                color="red"
                className="text-[10px]! leading-tight! px-1.5! py-0!"
              >
                Past cutoff — Escalated
              </Tag>
            )}
          </div>
          <Text className="text-xs! text-gray-600 block mt-0.5">
            Updated MW values for {dayjs(entry.date).format("YYYY-MM-DD")}
          </Text>
          {entry.changes && entry.changes.length > 0 && (
            <ChangesList changes={entry.changes} />
          )}
        </div>
      ),
    };
  });

  if (isContractLogsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="py-4 max-w-2xl">
      <Timeline items={timelineItems} />
    </div>
  );
};

export default AuditHistoryTab;
