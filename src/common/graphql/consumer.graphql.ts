import { gql } from "@apollo/client";

export const GET_LOAD_SCHEDULED_DAYS = gql`
  query GetLoadScheduleDays($filters: LoadScheduleDayFilterInput, $sort: 
LoadScheduleDaySortInput) {
    loadScheduleDays(filters: $filters, sort: $sort, pagination: {
      perPage: 31,
      pageNo: 1,
    }) {
      data {
        date
        id
        status
        totalLoad
        loadSchedules {
          id
          startTime
          endTime
          load
          factory {
            id
            thresholdPercentage
            maximumRequestLimit
          }
          pastAverageLoad
        }
        factory {
          id
          name
        }
        park {
          id
          name
          city
        }
      }
    }
  }
`;

export const DAY_WISE_PLAN_QUERY = gql`
  query GetDayWisePlanQuery($filters: LoadScheduleDayFilterInput, $sort: LoadScheduleDaySortInput) {
    loadScheduleDays (filters: $filters, sort: $sort, pagination: {
      perPage: 31,
      pageNo: 1,
    }) {
        data {
          date
          id
          status
          totalLoad
          park {
            id
            name
          }
          factory {
            id
            name
          }
      }
    }
  }
`;

export const OVERALL_PLAN_QUERY = gql`
  query GetOverallPlan($filters: LoadScheduleDayFilterInput, $sort: LoadScheduleDaySortInput) {
    loadSummary (filters: $filters, sort: $sort){
      data {
        date
        parkLoads {
          totalLoad
          park {
            id
            name
          }
        }
        factoryLoads {
          totalLoad
          factory {
            id
            name
          }
        }
        totalFactoryLoad
        totalParkLoad
      }
    }
  }
`;

export const EXPORT_SCHEDULE_DETAILS_MUTATION = gql`
  mutation ExportScheduleDetails($input: ExportScheduleDetailsInput!) {
    exportScheduleDetails(input: $input)
  }
`;

export const BULK_UPDATE_LOAD_SCHEDULES_MUTATION = gql`
  mutation BulkUpdateLoadSchedules($input: BulkUpdateInput!) {
    bulkUpdateLoadSchedules(input: $input) {
      id
      load
      pastAverageLoad
      startTime
      endTime
      loadScheduleDay {
        date
        id
        status
      }
    }
  }
`;

export const GET_CONTRACT_LOGS = gql`
  query GetContractLogs($contractId: ID!, $pagination: PagingInput) {
    contractLogs (contractId: $contractId, pagination: $pagination) {
      logs {
        changes
        date
        email
        fullName
        timeOfChange
      }
      paging {
        currentPage
        totalCount
        totalPages
      }
    }
  }
`;
