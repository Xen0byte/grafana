import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { CloudWatchMetricsQuery, CloudWatchQuery, MetricEditorMode, MetricQueryType } from '../types';
import { setupMockedDataSource } from '../__mocks__/CloudWatchDataSource';
import QueryHeader from './QueryHeader';

const ds = setupMockedDataSource({
  variables: [],
});
ds.datasource.getRegions = jest.fn().mockResolvedValue([]);
const metricQuery: CloudWatchMetricsQuery = {
  queryType: 'Metrics',
  id: '',
  region: 'us-east-2',
  namespace: '',
  period: '',
  alias: '',
  metricName: '',
  dimensions: {},
  matchExact: true,
  statistic: '',
  expression: '',
  refId: '',
};
const query: CloudWatchQuery = metricQuery;

describe('QueryHeader', () => {
  describe('confirm MetricQueryHeader', () => {
    it('should be shown when moving from code editor to builder when in sql mode', async () => {
      const onChange = jest.fn();
      const onRunQuery = jest.fn();
      query.metricEditorMode = MetricEditorMode.Code;
      query.metricQueryType = MetricQueryType.Query;

      render(
        <QueryHeader
          sqlCodeEditorIsDirty={true}
          datasource={ds.datasource}
          query={query}
          onChange={onChange}
          onRunQuery={onRunQuery}
        />
      );

      const builderElement = screen.getByLabelText('Builder');
      expect(builderElement).toBeInTheDocument();
      await act(async () => {
        await builderElement.click();
      });

      const modalTitleElem = screen.getByText('Are you sure?');
      expect(modalTitleElem).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not be shown when moving from builder to code when in sql mode', async () => {
      const onChange = jest.fn();
      const onRunQuery = jest.fn();
      query.metricEditorMode = MetricEditorMode.Builder;
      query.metricQueryType = MetricQueryType.Query;

      render(
        <QueryHeader
          sqlCodeEditorIsDirty={true}
          datasource={ds.datasource}
          query={query}
          onChange={onChange}
          onRunQuery={onRunQuery}
        />
      );

      const builderElement = screen.getByLabelText('Code');
      expect(builderElement).toBeInTheDocument();
      await act(async () => {
        await builderElement.click();
      });

      const modalTitleElem = screen.queryByText('Are you sure?');
      expect(modalTitleElem).toBeNull();
      expect(onChange).toHaveBeenCalled();
    });

    it('should not be shown when moving from code to builder when in standard mode', async () => {
      const onChange = jest.fn();
      const onRunQuery = jest.fn();
      query.metricEditorMode = MetricEditorMode.Code;
      query.metricQueryType = MetricQueryType.Search;

      render(
        <QueryHeader
          sqlCodeEditorIsDirty={true}
          datasource={ds.datasource}
          query={query}
          onChange={onChange}
          onRunQuery={onRunQuery}
        />
      );

      const builderElement = screen.getByLabelText('Builder');
      expect(builderElement).toBeInTheDocument();
      await act(async () => {
        await builderElement.click();
      });

      const modalTitleElem = screen.queryByText('Are you sure?');
      expect(modalTitleElem).toBeNull();
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('run button should be displayed in code editor in metric query mode', async () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    query.metricEditorMode = MetricEditorMode.Code;
    query.metricQueryType = MetricQueryType.Query;

    render(
      <QueryHeader
        sqlCodeEditorIsDirty={true}
        datasource={ds.datasource}
        query={query}
        onChange={onChange}
        onRunQuery={onRunQuery}
      />
    );

    const runQueryButton = screen.getByText('Run query');
    expect(runQueryButton).toBeInTheDocument();
    await act(async () => {
      await runQueryButton.click();
    });
    expect(onRunQuery).toHaveBeenCalled();
  });
});
