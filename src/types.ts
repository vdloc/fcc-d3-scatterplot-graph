import { Selection } from 'd3-selection';
import { ScaleLinear, NumberValue } from 'd3-scale';
import { Axis } from 'd3-axis';

export type ChartOptions = {
  title: string;
  description: string;
  width: number;
  height: number;
  spacing: number;
  chartElement: HTMLElement | null;
};

export type ChartMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ChartSvg = Selection<
  SVGSVGElement,
  unknown,
  null,
  undefined
> | null;
export type ChartScale = ScaleLinear<number, number>;
export type ChartAxis = Axis<NumberValue> | null;

export type DatasetItem = {
  Time: string;
  Place: number;
  Seconds: number;
  Name: string;
  Year: number;
  Nationality: string;
  Doping: string;
  URL: string;
};

export interface IScatterPlotChart extends ChartOptions {
  init: () => void;
  createTitle: () => void;
  createAxes: () => void;
  getDataset: () => void;
  getMaxTime: (times: string[]) => string;
  margin: ChartMargin;
  svg: ChartSvg;
  dataUrl: string;
  dataset: DatasetItem[];
  xScale: ChartScale | null;
  yScale: ChartScale | null;
  xAxis: ChartAxis | null;
  yAxis: ChartAxis | null;
}
