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
