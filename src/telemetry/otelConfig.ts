import 'react-native-get-random-values'; // Required for generating unique IDs in React Native
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'; // For logging
import { Resource } from '@opentelemetry/resources'; // For defining resources
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'; // For handle tracing batching
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics-base'; // For push metrics
import axios, {AxiosResponse} from 'axios';
import { Config } from './Config';
import { sendLogToLoki } from './utils';

// Custom OTLP Trace Exporter for React Native
class CustomOTLPTraceExporter {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async export(spans: any[], resultCallback: (result: { code: number; error?: Error }) => void): Promise<void> {
    const body = {
      resourceSpans: spans.map((span) => span.toReadableSpan()),
    };

    try {
      const response: AxiosResponse = await axios.post(this.endpoint, body, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        resultCallback({ code: 0 }); // Success
      } else {
        console.error(
          'Failed to export spans:',
          response.statusText,
          'errorText:',
          response.data
        );
        resultCallback({ code: 1, error: new Error(response.statusText) });
      }
    } catch (error: any) {
      console.error('Error exporting spans:', error);
      resultCallback({ code: 1, error });
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

// Custom OTLP Metric Exporter for React Native
class CustomOTLPMetricExporter {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async export(metrics: any[], resultCallback: (result: { code: number; error?: Error }) => void): Promise<void> {

    try {
      const response: AxiosResponse = await axios.post(this.url, { metrics }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        resultCallback({ code: 0 }); // Success
      } else {
        console.error(
          'Failed to export metrics:',
          response.statusText,
          'errorText:',
          response.data
        );
        resultCallback({ code: 1, error: new Error(response.statusText) });
      }
    } catch (error: any) {
      console.error('Error exporting metrics:', error);
      resultCallback({ code: 1, error });
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

// Enable debugging for OpenTelemetry logging
diag.setLogger({
  debug: (msg: any) => sendLogToLoki('DEBUG', msg),
  info: (msg: any) => sendLogToLoki('INFO', msg),
  warn: (msg: any) => sendLogToLoki('WARN', msg),
  error: (msg: any) => sendLogToLoki('ERROR', msg),
});

// Define a resource for the telemetry data
const resource = new Resource({
  'service.name': 'TodoApp',
  'service.version': '1.0.0',
  'environment': 'development',
  'service.instance.id': `${Math.random().toString(36).substring(2)}`,
});

// Tracer Provider for React Native
const tracerProvider = new BasicTracerProvider({
  resource,
});

// Set up a custom OTLP Trace Exporter
const traceExporter = new CustomOTLPTraceExporter(Config.OTEL_TRACES_URL);

// Add the BatchSpanProcessor for batching spans
tracerProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter, { maxExportBatchSize: 1 }));

// Metric Provider and Exporter
const metricExporter = new CustomOTLPMetricExporter(Config.ALLOY_URL);
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 5000, // Export metrics every 50 seconds
});

const meterProvider = new MeterProvider({
  resource,
});
meterProvider.addMetricReader(metricReader);

// Initialize OpenTelemetry
export const initTelemetry = async (): Promise<void> => {
  try {
    // Register the tracer provider for spans
    tracerProvider.register();
    diag.debug('Tracing provider registered successfully.');
    // Start collecting metrics automatically
    diag.debug('Metrics provider initialized and running.');
  } catch (error: any) {
    diag.error('Error initializing telemetry:', error);
  }
};