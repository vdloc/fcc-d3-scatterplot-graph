import { select, selectAll, Selection } from 'd3-selection';
import { scaleLinear, scaleTime, scaleOrdinal } from 'd3-scale';
import { axisTop } from 'd3-axis';

type ChartOptions = {
  title: string;
  description: string;
  width: number;
  height: number;
  spacing: number;
  chartElement: HTMLElement | null;
};

type ChartMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type ChartSvg = Selection<SVGSVGElement, unknown, null, undefined> | null;

interface IScatterPlotChart extends ChartOptions {
  init: () => void;
  createTitle: () => void;
  margin: ChartMargin;
  svg: ChartSvg;
}

export class ScatterPlotChart implements IScatterPlotChart {
  title: string;
  description: string;
  width: number;
  height: number;
  spacing: number;
  margin: ChartMargin;
  chartElement: HTMLElement | null;
  svg: ChartSvg;
  constructor({
    title,
    description,
    width,
    height,
    spacing,
    chartElement,
  }: ChartOptions) {
    this.title = title;
    this.description = description;
    this.width = width;
    this.height = height;
    this.spacing = spacing;
    this.margin = {
      top: spacing,
      right: spacing,
      bottom: spacing,
      left: spacing,
    };
    this.chartElement = chartElement;
    this.svg = null;
  }

  init() {
    this.svg = select(this.chartElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    this.createTitle();
    console.log(this);
  }

  createTitle() {
    this.svg
      ?.append('text')
      .attr('x', this.width / 2)
      .attr('y', this.margin.top)
      .attr('id', 'title')
      .attr('class', 'chart-title')
      .attr('text-anchor', 'middle')
      .text(this.title);
  }
}
