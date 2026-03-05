import { useGlobals } from "@/common/context/globals";
import { EXPORT_SCHEDULE_DETAILS_MUTATION } from "@/common/graphql/consumer.graphql";
import { ExportScheduleDetailsMutation, ExportScheduleDetailsMutationVariables } from "@/generated/graphql";
import { faFileExport } from "@awesome.me/kit-31481ff84e/icons/classic/regular";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation } from "@apollo/client";
import { Button, message } from "antd";
import dayjs from "dayjs";

interface ExportScheduleButtonProps {
  date: {
    from: string;
    to: string;
  };
  label?: string;
}

const ExportScheduleButton = (props: ExportScheduleButtonProps) => {
  const { date, label } = props;
  const { currentPark } = useGlobals();
  const { contractId } = currentPark ?? {};

  const [exportScheduleDetails, {
    loading: exportScheduleDetailsLoading,
  }] = useMutation<ExportScheduleDetailsMutation, ExportScheduleDetailsMutationVariables>(EXPORT_SCHEDULE_DETAILS_MUTATION);

  const handleExport = () => {
    if (!contractId) {
      return;
    }

    const formattedDateFrom = dayjs(date.from).format("YYYY-MM-DD");
    const formattedDateTo = dayjs(date.to).format("YYYY-MM-DD");
    exportScheduleDetails({
      variables: {
        input: {
          dateRange: {
            from: formattedDateFrom,
            to: formattedDateTo,
          },
          contractId,
        }
      }
    }).then(() => {
      message.success("We've got your export request! You'll receive it via email momentarily.");
    }).catch(() => {
      message.error("Failed to export schedule details");
    });
  };

  return (
    <Button
      icon={<FontAwesomeIcon icon={faFileExport} />}
      loading={exportScheduleDetailsLoading}
      onClick={handleExport}
    >
      {label}
    </Button>
  );
};

export default ExportScheduleButton;
