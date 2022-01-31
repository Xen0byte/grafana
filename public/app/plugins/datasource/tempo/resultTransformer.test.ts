import { ArrayVector, FieldType, MutableDataFrame } from '@grafana/data';
import { createTableFrame, transformToOTLP, transformFromOTLP, transformTrace } from './resultTransformer';
import { badOTLPResponse, otlpDataFrameToResponse, otlpDataFrameFromResponse, otlpResponse } from './testResponse';
import { collectorTypes } from '@opentelemetry/exporter-collector';

describe('transformTraceList()', () => {
  const lokiDataFrame = new MutableDataFrame({
    fields: [
      {
        name: 'ts',
        type: FieldType.time,
        values: ['2020-02-12T15:05:14.265Z', '2020-02-12T15:05:15.265Z', '2020-02-12T15:05:16.265Z'],
      },
      {
        name: 'line',
        type: FieldType.string,
        values: [
          't=2020-02-12T15:04:51+0000 lvl=info msg="Starting Grafana" logger=server',
          't=2020-02-12T15:04:52+0000 lvl=info msg="Starting Grafana" logger=server traceID=asdfa1234',
          't=2020-02-12T15:04:53+0000 lvl=info msg="Starting Grafana" logger=server traceID=asdf88',
        ],
      },
    ],
    meta: {
      preferredVisualisationType: 'table',
    },
  });

  test('extracts traceIDs from log lines', () => {
    const frame = createTableFrame(lokiDataFrame, 't1', 'tempo', ['traceID=(\\w+)', 'traceID=(\\w\\w)']);
    expect(frame.fields[0].name).toBe('Time');
    expect(frame.fields[0].values.get(0)).toBe('2020-02-12T15:05:15.265Z');
    expect(frame.fields[1].name).toBe('traceID');
    expect(frame.fields[1].values.get(0)).toBe('asdfa1234');
    // Second match in new line
    expect(frame.fields[0].values.get(1)).toBe('2020-02-12T15:05:15.265Z');
    expect(frame.fields[1].values.get(1)).toBe('as');
  });
});

describe('transformToOTLP()', () => {
  test('transforms dataframe to OTLP format', () => {
    const otlp = transformToOTLP(otlpDataFrameToResponse);
    expect(otlp).toMatchObject(otlpResponse);
  });
});

describe('transformFromOTLP()', () => {
  test('transforms OTLP format to dataFrame', () => {
    const res = transformFromOTLP(
      (otlpResponse.batches as unknown) as collectorTypes.opentelemetryProto.trace.v1.ResourceSpans[],
      false
    );
    expect(res.data[0]).toMatchObject(otlpDataFrameFromResponse);
  });
});

describe('transformFromOTLP()', () => {
  // Mock the console error so that running the test suite doesnt throw the error
  const origError = console.error;
  const consoleErrorMock = jest.fn();
  afterEach(() => (console.error = origError));
  beforeEach(() => (console.error = consoleErrorMock));

  test('if passed bad data, will surface an error', () => {
    const res = transformFromOTLP(
      (badOTLPResponse.batches as unknown) as collectorTypes.opentelemetryProto.trace.v1.ResourceSpans[],
      false
    );

    expect(res.data[0]).toBeFalsy();
    expect(res?.error?.message).toContain('JSON is not valid OpenTelemetry format');
    // if it does have resources, no error will be thrown
    expect({
      ...res.data[0],
      resources: {
        attributes: [
          { key: 'service.name', value: { stringValue: 'db' } },
          { key: 'job', value: { stringValue: 'tns/db' } },
          { key: 'opencensus.exporterversion', value: { stringValue: 'Jaeger-Go-2.22.1' } },
          { key: 'host.name', value: { stringValue: '63d16772b4a2' } },
          { key: 'ip', value: { stringValue: '0.0.0.0' } },
          { key: 'client-uuid', value: { stringValue: '39fb01637a579639' } },
        ],
      },
    }).not.toBeFalsy();
  });
});

describe('transformTrace()', () => {
  // Mock the console error so that running the test suite doesnt throw the error
  const origError = console.error;
  const consoleErrorMock = jest.fn();
  afterEach(() => (console.error = origError));
  beforeEach(() => (console.error = consoleErrorMock));

  const badFrame = new MutableDataFrame({
    fields: [
      {
        name: 'serviceTags',
        values: new ArrayVector([undefined]),
      },
    ],
  });

  const goodFrame = new MutableDataFrame({
    fields: [
      {
        name: 'serviceTags',
        values: new ArrayVector(),
      },
    ],
  });

  test('if passed bad data, will surface an error', () => {
    const response = transformTrace({ data: [badFrame] }, false);
    expect(response.data[0]).toBeFalsy();
    expect(response?.error?.message).toContain('JSON is not valid OpenTelemetry format');

    const response2 = transformTrace({ data: [goodFrame] }, false);
    expect(response2.data[0]).not.toBeFalsy();
  });
});
