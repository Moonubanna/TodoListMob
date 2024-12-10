  export const Config = {
    OTEL_TRACES_URL: "http://localhost:4318/v1/traces", // Trace endpoint //http://localhost:4318/v1/traces
    ALLOY_URL: "http://localhost:9090/api/v1/write", // Grafana Alloy endpoint //http://localhost:9090/api/metrics
    LOKI_URL: "http://localhost:4318/v1/logs" // Loki endpoint //http://localhost:3100/loki/api/v1/push
  };