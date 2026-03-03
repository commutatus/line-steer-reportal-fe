import { GET_CONTRACTS } from "@/common/graphql/constants";
import { GetContractsQuery, GetContractsQueryVariables } from "@/generated/graphql";
import { useQuery } from "@apollo/client";
import { Form, Select } from "antd";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef } from "react";

interface GeneratorFiltersForm {
  plantId: string | null;
  parkId: string | null;
}

const GeneratorFilters = () => {
  const [form] = Form.useForm<GeneratorFiltersForm>();
  const { data: contractsData } = useQuery<GetContractsQuery, GetContractsQueryVariables>(GET_CONTRACTS);
  const contracts = useMemo(() => contractsData?.contracts?.data ?? [], [contractsData]);
  const parkId = Form.useWatch("parkId", form);
  const plantId = Form.useWatch("plantId", form);
  const router = useRouter();
  const isSyncingFromUrl = useRef(false);

  const parks = useMemo(() => {
    const seen = new Set<string>();
    return contracts.reduce<{ value: string; label: string }[]>((acc, contract) => {
      const id = contract.park?.id;
      if (id && !seen.has(id)) {
        seen.add(id);
        acc.push({ value: id, label: contract.park?.name ?? "" });
      }
      return acc;
    }, []);
  }, [contracts]);

  const plants = useMemo(() => {
    const seen = new Set<string>();
    return contracts
      .filter(contract => contract.park?.id === parkId)
      .reduce<{ value: string; label: string }[]>((acc, contract) => {
        const id = contract.factory?.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          acc.push({ value: id, label: contract.factory?.name ?? "" });
        }
        return acc;
      }, []);
  }, [contracts, parkId]);

  // Sync form values from URL query params on mount / URL change
  useEffect(() => {
    const queryParkId = typeof router.query.parkId === "string" ? router.query.parkId : null;
    const queryPlantId = typeof router.query.plantId === "string" ? router.query.plantId : null;
    isSyncingFromUrl.current = true;
    form.setFieldsValue({ plantId: queryPlantId, parkId: queryParkId });
  }, [router.query.plantId, router.query.parkId, form]);

  // Sync URL query params from form values
  useEffect(() => {
    if (isSyncingFromUrl.current) {
      isSyncingFromUrl.current = false;
      return;
    }

    const url = new URL(window.location.href);
    if (plantId) {
      url.searchParams.set("plantId", plantId);
    } else {
      url.searchParams.delete("plantId");
    }
    if (parkId) {
      url.searchParams.set("parkId", parkId);
    } else {
      url.searchParams.delete("parkId");
    }
    router.replace(url.pathname + url.search);
  }, [plantId, parkId, router]);

  const handleParkChange = useCallback(() => {
    form.setFieldValue("plantId", null);
  }, [form]);

  return (
    <Form form={form} className="flex gap-2 items-center">
      <Form.Item name="parkId" label="Park" className="mb-0!">
        <Select placeholder="Select a Park" options={parks} allowClear onChange={handleParkChange} />
      </Form.Item>
      <Form.Item name="plantId" label="Plant" dependencies={["parkId"]} className="mb-0!">
        <Select placeholder="Select a Plant" options={plants} allowClear disabled={!parkId} />
      </Form.Item>
    </Form>
  );
}

export default GeneratorFilters;
