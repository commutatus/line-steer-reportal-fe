import React, { useMemo, useState } from 'react';
import { Timeline, Typography, Button, Tag } from 'antd';
import { ClockCircleOutlined, EditOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface AuditChange {
  slot: string;
  oldValue: number | null;
  newValue: number | null;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userEmail: string;
  plantId: string;
  plantName: string;
  parkName: string;
  date: string;
  action: 'updated';
  description: string;
  changes?: AuditChange[];
  pastCutoff?: boolean;
}

interface MockPlant {
  id: string;
  name: string;
  parkId: string;
}

interface MockPark {
  id: string;
  name: string;
}

const MOCK_PARKS: MockPark[] = [
  { id: 'park-1', name: 'Solar Park Alpha' },
  { id: 'park-2', name: 'Wind Park Beta' },
];

const MOCK_PLANTS: MockPlant[] = [
  { id: 'plant-1', name: 'Plant A', parkId: 'park-1' },
  { id: 'plant-2', name: 'Plant B', parkId: 'park-1' },
  { id: 'plant-3', name: 'Plant C', parkId: 'park-2' },
];

const MOCK_USERS = [
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com' },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com' },
  { name: 'Meena Patel', email: 'meena.patel@example.com' },
  { name: 'Amit Singh', email: 'amit.singh@example.com' },
];

const CUTOFF_HOURS = 12;

const generateMockAuditEntries = (plants: MockPlant[]): AuditEntry[] => {
  const entries: AuditEntry[] = [];
  const parkMap = Object.fromEntries(MOCK_PARKS.map((p) => [p.id, p.name]));
  const now = new Date();

  plants.forEach((plant) => {
    for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
      const date = new Date(now.getFullYear(), now.getMonth(), dayOffset + 1);
      const dateStr = date.toISOString().split('T')[0];

      const numUpdates = 1 + Math.floor(Math.random() * 2);
      for (let u = 0; u < numUpdates; u++) {
        const updatedAt = new Date(date);
        updatedAt.setHours(
          8 + Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 60),
          0,
        );
        const numChanges = 2 + Math.floor(Math.random() * 8);
        const changes: AuditChange[] = [];
        for (let c = 0; c < numChanges; c++) {
          const slotHour = Math.floor(Math.random() * 24);
          const slotMin = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
          const slotLabel = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;
          changes.push({
            slot: slotLabel,
            oldValue: Math.round(Math.random() * 5 * 100) / 100,
            newValue: Math.round(Math.random() * 5 * 100) / 100,
          });
          changes.push({
            slot: slotLabel,
            oldValue: Math.round(Math.random() * 5 * 100) / 100,
            newValue: Math.round(Math.random() * 5 * 100) / 100,
          });
        }
        entries.push({
          id: `audit-${plant.id}-${dayOffset}-update-${u}`,
          timestamp: updatedAt.toISOString(),
          ...(() => {
            const mockUser =
              MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
            return { user: mockUser.name, userEmail: mockUser.email };
          })(),
          plantId: plant.id,
          plantName: plant.name,
          parkName: parkMap[plant.parkId] || 'Unknown',
          date: dateStr,
          action: 'updated',
          description: `Updated MW values for ${dateStr}`,
          changes,
          pastCutoff: updatedAt.getHours() >= CUTOFF_HOURS,
        });
      }
    }
  });

  entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  // Mark exactly 2 entries as past cutoff escalations
  if (entries.length >= 5) {
    entries[2].pastCutoff = true;
    entries[4].pastCutoff = true;
  } else {
    entries.slice(0, 2).forEach((e) => {
      e.pastCutoff = true;
    });
  }

  return entries;
};

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
          <Text code className="!text-[11px]">
            {c.slot}
          </Text>
          <Text type="secondary" className="text-sm!">{c.oldValue ?? '—'}</Text>
          <span>→</span>
          <Text strong className="text-sm!">{c.newValue ?? '—'}</Text>
          <Text type="secondary" className="text-sm!">MW</Text>
        </div>
      ))}
      {hasMore && (
        <Button
          type="link"
          size="small"
          className="!p-0 !h-auto !text-xs"
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

interface AuditHistoryTabProps {
  selectedPlantId?: string | null;
}

const AuditHistoryTab: React.FC<AuditHistoryTabProps> = ({
  selectedPlantId,
}) => {
  const auditEntries = useMemo(() => {
    const allEntries = generateMockAuditEntries(MOCK_PLANTS);
    if (selectedPlantId) {
      return allEntries.filter((e) => e.plantId === selectedPlantId);
    }
    return allEntries;
  }, [selectedPlantId]);

  const timelineItems = auditEntries.map((entry) => {
    const d = new Date(entry.timestamp);
    const timeStr =
      d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ' ' +
      d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });

    return {
      key: entry.id,
      color: entry.pastCutoff ? ('red' as const) : ('blue' as const),
      dot: <EditOutlined />,
      children: (
        <div className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Text strong className="text-sm!">
              {entry.user}
            </Text>
            <Text type="secondary" className="text-xs!">
              ({entry.userEmail})
            </Text>
            <Text type="secondary" className="text-xs!">
              <ClockCircleOutlined className="mr-1" />
              {timeStr}
            </Text>
            {entry.pastCutoff && (
              <Tag
                color="red"
                className="text-[10px]! !leading-tight !px-1.5 !py-0"
              >
                Past cutoff — Escalated
              </Tag>
            )}
          </div>
          <Text className="text-xs! text-gray-600 block mt-0.5">
            {entry.description}
          </Text>
          {entry.changes && entry.changes.length > 0 && (
            <ChangesList changes={entry.changes} />
          )}
        </div>
      ),
    };
  });

  return (
    <div className="py-4 max-w-2xl">
      <Timeline items={timelineItems} />
    </div>
  );
};

export default AuditHistoryTab;
