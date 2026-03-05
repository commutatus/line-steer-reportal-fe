import { useGlobals } from '@/common/context/globals'
import { UserType } from '@/common/hooks/useCurrentUser';
import React from 'react'
import OverallPlanConsumer from './overall-plan-consumer';
import OverAllPlanGenerator from './overall-plan-generator';

const OverAllPlan = () => {
  const { currentUser } = useGlobals();

  const { userType } = currentUser ?? {};

  if (userType === UserType.CONSUMER) {
    return <OverallPlanConsumer />
  }
  return (
    <OverAllPlanGenerator />
  )
}

export default OverAllPlan