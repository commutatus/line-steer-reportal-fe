import { useGlobals } from "@/common/context/globals";
import { UserType } from "@/common/hooks/useCurrentUser";
import DayWisePlanConsumer from "./day-wise-plan-consumer";
import DayWisePlanGenerator from "./day-wise-plan-generator";


const DayWisePlan = () => {
  const { currentUser } = useGlobals();
  const { userType } = currentUser ?? {};

  if (userType === UserType.CONSUMER) {
    return <DayWisePlanConsumer />
  }

  return (
    <DayWisePlanGenerator />
  );
};

export default DayWisePlan;
