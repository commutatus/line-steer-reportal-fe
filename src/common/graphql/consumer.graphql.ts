import { gql } from "@apollo/client";

export const GET_LOAD_SCHEDULED_DAYS = gql`
  query GetLoadScheduleDays($filters: LoadScheduleDayFilterInput, $sort: 
LoadScheduleDaySortInput) {
    loadScheduleDays(filters: $filters, sort: $sort) {
      data {
        date
        id
        status
        loadSchedules {
          id
          startTime
          endTime
          load
        }
      }
    }
  }
`;

export const DAY_WISE_PLAN_QUERY = gql`
  query GetDayWisePlanQuery($filters: LoadScheduleDayFilterInput) {
    loadScheduleDays (filters: $filters) {
        data {
          date
          id
          status
          totalLoad
          park {
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
        totalLoad
        parkLoads {
          totalLoad
          park {
            id
            name
          }
        }
      }
    }
  }
`;
