import { select, selectAll, Selection } from 'd3-selection';
import {
  scaleLinear,
  scaleTime,
  scaleOrdinal,
  ScaleLinear,
  NumberValue,
} from 'd3-scale';
import { axisLeft, axisBottom, Axis } from 'd3-axis';
import { extent, max, AxisDomain } from 'd3';

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
type ChartScale = ScaleLinear<number, number>;
type ChartAxis = Axis<NumberValue> | null;

type DatasetItem = {
  Time: string;
  Place: number;
  Seconds: number;
  Name: string;
  Year: number;
  Nationality: string;
  Doping: string;
  URL: string;
};

interface IScatterPlotChart extends ChartOptions {
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

export class ScatterPlotChart implements IScatterPlotChart {
  title: string;
  description: string;
  width: number;
  height: number;
  spacing: number;
  margin: ChartMargin;
  chartElement: HTMLElement | null;
  svg: ChartSvg;
  dataUrl: string;
  dataset: DatasetItem[] = [];
  xScale: ChartScale | null;
  yScale: ChartScale | null;
  xAxis: ChartAxis | null;
  yAxis: ChartAxis | null;

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
    this.xScale = null;
    this.yScale = null;
    this.xAxis = null;
    this.yAxis = null;
    this.dataUrl =
      'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
  }

  async init() {
    this.dataset = await this.getDataset();
    this.svg = select(this.chartElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    this.createTitle();
    this.createAxes();
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

  createAxes() {
    const xRange = extent(this.dataset, (d: DatasetItem) => d.Year) as [
      number,
      number
    ];
    this.xScale = scaleLinear()
      .domain([xRange[0] - 1, xRange[1]])
      .range([this.margin.left, this.width - this.margin.right]);
    this.yScale = scaleLinear()
      .domain(
        extent(this.dataset, (d: DatasetItem) =>
          this.getTimeInSeconds(d.Time)
        ) as [number, number]
      )
      .range([this.margin.top, this.height - this.margin.bottom]);

    this.xAxis = axisBottom(this.xScale);
    this.yAxis = axisLeft(this.yScale).tickFormat(
      (d: NumberValue, index: number) => {
        const value = d as number;
        const minutes = Math.floor(value / 60);
        const seconds = new Intl.NumberFormat('en-US', {
          minimumIntegerDigits: 2,
        }).format(value & 60);
        return `${minutes}:${seconds}`;
      }
    );
    this.svg
      ?.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${this.height - this.margin.bottom})`)
      .call(this.xAxis);
    this.svg
      ?.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(this.yAxis);
  }

  getMaxTime(times: string[]) {
    let maxTime = '0:0';

    times.forEach((time) => {
      let [minutes, seconds] = time.split(':').map(Number);
      let [maxMinutes, maxSeconds] = maxTime.split(':').map(Number);
      let totalSeconds = minutes * 60 + seconds;
      let maxTotalSeconds = maxMinutes * 60 + maxSeconds;

      if (totalSeconds > maxTotalSeconds) {
        maxTime = time;
      }
    });
    return maxTime;
  }

  async getDataset() {
    try {
      const response = await fetch(this.dataUrl);
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  getTimeInSeconds(time: string) {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
  }
}
