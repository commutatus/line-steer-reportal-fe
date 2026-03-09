import { GET_CONTRACTS } from "@/common/graphql/constants";
import { GetContractsQuery, GetContractsQueryVariables } from "@/generated/graphql";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthStatesEnum } from "./useAuth";

interface ParkOption {
  id: string;
  name: string | null;
  city: string | null;
}

interface FactoryOption {
  id: string;
  name: string | null;
}

interface UseCurrentParkProps {
  authState: AuthStatesEnum;
}

const useCurrentPark = ({
  authState,
}: UseCurrentParkProps) => {
  const [selectedParkId, setSelectedParkId] = useState<string | null>(null);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);

  const { data: contractsData, loading: contractsLoading } = useQuery<
    GetContractsQuery,
    GetContractsQueryVariables
  >(GET_CONTRACTS, {
    skip: authState !== AuthStatesEnum.loggedIn
  });

  const contracts = useMemo(
    () => contractsData?.contracts?.data ?? [],
    [contractsData]
  );

  const parks = useMemo(() => {
    const seen = new Set<string>();
    return contracts.reduce<ParkOption[]>((acc, contract) => {
      const id = contract.park?.id;
      if (id && !seen.has(id)) {
        seen.add(id);
        acc.push({
          id,
          name: contract.park?.name ?? null,
          city: contract.park?.city ?? null,
        });
      }
      return acc;
    }, []);
  }, [contracts]);

  const factories = useMemo(() => {
    if (!selectedParkId) {
      return [];
    }
    const seen = new Set<string>();
    return contracts
      .filter((contract) => contract.park?.id === selectedParkId)
      .reduce<FactoryOption[]>((acc, contract) => {
        const id = contract.factory?.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          acc.push({
            id,
            name: contract.factory?.name ?? null,
          });
        }
        return acc;
      }, []);
  }, [contracts, selectedParkId]);

  const selectedPark = useMemo(
    () => parks.find((p) => p.id === selectedParkId) ?? null,
    [parks, selectedParkId]
  );

  const selectedFactory = useMemo(
    () => factories.find((f) => f.id === selectedFactoryId) ?? null,
    [factories, selectedFactoryId]
  );

  const contractId = useMemo(() => {
    if (!selectedParkId) {
      return null;
    }
    const matchingContract = contracts.find((contract) => {
      const parkMatches = contract.park?.id === selectedParkId;
      if (selectedFactoryId) {
        return parkMatches && contract.factory?.id === selectedFactoryId;
      }
      return parkMatches;
    });
    return matchingContract?.id ?? null;
  }, [contracts, selectedParkId, selectedFactoryId]);

  const selectPark = useCallback(
    (parkId: string) => {
      setSelectedParkId(parkId);
      setSelectedFactoryId(null);
    },
    []
  );

  const selectFactory = useCallback(
    (factoryId: string | null) => {
      setSelectedFactoryId(factoryId);
    },
    []
  );

  const resetPark = useCallback(() => {
    setSelectedParkId(null);
    setSelectedFactoryId(null);
  }, []);

  useEffect(() => {
    const isParkIdValid = selectedParkId && parks.some((p) => p.id === selectedParkId);
    
    if (!isParkIdValid) {
      if (parks.length > 0) {
        setSelectedParkId(parks[0].id);
      } else {
        setSelectedParkId(null);
        setSelectedFactoryId(null);
      }
    }
  }, [parks, selectedParkId]);

  return {
    selectedPark,
    selectedFactory,
    parks,
    factories,
    parkId: selectedParkId,
    factoryId: selectedFactoryId,
    contractId,
    selectPark,
    selectFactory,
    resetPark,
    contractsLoading,
  };
};

export default useCurrentPark;
