import { EXPORT_FACTORY_DETAILS_MUTATION } from "@/common/graphql/consumer.graphql";
import { ExportFactoryDetailsMutation, ExportFactoryDetailsMutationVariables } from "@/generated/graphql";
import { faFileExport } from "@awesome.me/kit-31481ff84e/icons/classic/regular";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation } from "@apollo/client";
import { Button, message } from "antd";
import dayjs from "dayjs";

interface ExportFactoryDetailsButtonProps {
  date: {
    from: string;
    to: string;
  };
  label?: string;
}

const ExportFactoryDetailsButton = (props: ExportFactoryDetailsButtonProps) => {
  const { date, label } = props;

  const [exportFactoryDetails, {
    loading: exportFactoryDetailsLoading,
  }] = useMutation<ExportFactoryDetailsMutation, ExportFactoryDetailsMutationVariables>(EXPORT_FACTORY_DETAILS_MUTATION);

  const handleExport = () => {

    const formattedDateFrom = dayjs(date.from).format("YYYY-MM-DD");
    const formattedDateTo = dayjs(date.to).format("YYYY-MM-DD");
    exportFactoryDetails({
      variables: {
        input: {
          dateRange: {
            from: formattedDateFrom,
            to: formattedDateTo,
          },
        }
      }
    }).then(() => {
      message.success("We've got your export request! You'll receive it via email momentarily.");
    }).catch(() => {
      message.error("Failed to export factory details");
    });
  };

  return (
    <Button
      icon={<FontAwesomeIcon icon={faFileExport} />}
      loading={exportFactoryDetailsLoading}
      onClick={handleExport}
    >
      {label}
    </Button>
  );
};

export default ExportFactoryDetailsButton;
