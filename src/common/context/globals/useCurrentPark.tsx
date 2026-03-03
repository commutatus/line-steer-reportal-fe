import { GET_CONTRACTS } from "@/common/graphql/constants";
import { GetContractsQuery, GetContractsQueryVariables } from "@/generated/graphql";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";

interface SelectedPark {
  id: string;
  name: string | null;
  city: string | null;
  contractId: string;
}

const useCurrentPark = () => {
  const [selectedPark, setSelectedPark] = useState<SelectedPark | null>(null);

  const { data: contractsData, loading: contractsLoading } = useQuery<
    GetContractsQuery,
    GetContractsQueryVariables
  >(GET_CONTRACTS);

  const contracts = useMemo(
    () => contractsData?.contracts?.data ?? [],
    [contractsData]
  );

  const parks = useMemo(
    () =>
      contracts.map((contract) => ({
        id: contract.park?.id ?? "",
        name: contract.park?.name ?? null,
        city: contract.park?.city ?? null,
        contractId: contract.id,
      })),
    [contracts]
  );

  const selectPark = useCallback(
    (parkId: string) => {
      const park = parks.find((p) => p.id === parkId) ?? null;
      setSelectedPark(park);
    },
    [parks]
  );

  useEffect(() => {
    if (!selectedPark && parks.length > 0) {
      setSelectedPark(parks[0]);
    }
  }, [parks, selectedPark]);

  const parkId = selectedPark?.id ?? null;
  const contractId = selectedPark?.contractId ?? null;

  return {
    selectedPark,
    parks,
    parkId,
    contractId,
    selectPark,
    contractsLoading,
  };
};

export default useCurrentPark;
