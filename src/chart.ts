import {
  DatasetItem,
  ChartAxis,
  ChartMargin,
  ChartOptions,
  ChartLinearScale,
  ChartSvg,
  IScatterPlotChart,
  ChartTimeScale,
} from './types';

import { select, selectAll } from 'd3-selection';
import { scaleLinear, NumberValue, scaleTime } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { extent, timeFormat } from 'd3';

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
  xScale: ChartLinearScale | null;
  yScale: ChartTimeScale | null;
  xAxis: ChartAxis | null;
  yAxis: ChartAxis | null;

  legends = {
    noAllegations: {
      label: 'No doping allegations',
      color: 'orange',
    },
    allegations: {
      label: 'Riders with doping allegations',
      color: 'steelblue',
    },
  };
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
    this.updateDataset();
    this.svg = select(this.chartElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    this.createTitle();
    this.createAxes();
    this.createPlots();
    this.createLegend();
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
    this.yScale = scaleTime()
      .domain(
        extent(this.dataset, (d: DatasetItem) => {
          return d.Time;
        }) as unknown as [number, number]
      )
      .range([this.margin.top * 1.2, this.height - this.margin.bottom]);

    this.xAxis = axisBottom(this.xScale).tickFormat(
      (d: NumberValue, index: number) => {
        const value = d as number;
        const date = new Date();
        date.setFullYear(value);
        const year = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
        }).format(date);
        return year;
      }
    );
    this.yAxis = axisLeft(this.yScale).tickFormat((value) => {
      // Check if the value is a Date
      if (value instanceof Date) {
        return timeFormat('%M:%S')(value);
      }

      // If the value is a number, convert it to a Date, assuming it's a timestamp
      const date = new Date(value.valueOf());

      return timeFormat('%M:%S')(date);
    });
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

  createPlots() {
    const tooltip = select('#tooltip');

    this.svg
      ?.selectAll('circle')
      .data(this.dataset)
      .enter()
      .append('circle')
      .attr('cx', (d) => (this.xScale ? this.xScale(d.Year) : d.Year))
      .attr('cy', (d) => {
        return this.yScale
          ? this.yScale(d.Time)
          : new Date(d.Time).getMinutes();
      })
      .attr('r', 7)
      .attr('fill', (d) =>
        d.Doping
          ? this.legends.allegations.color
          : this.legends.noAllegations.color
      )
      .attr('opacity', 0.8)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('data-xvalue', (d) => d.Year)
      ?.attr('data-yvalue', (d) => {
        return new Date(d.Time).toUTCString();
      })
      .attr('class', 'dot')
      .on('mouseenter', (event: MouseEvent, d: DatasetItem) => {
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip
          .html(
            `
          ${d.Name} : ${d.Nationality}
          </br>
          Year: ${d.Year}, Time: ${d.Time}
          </br></br>
          ${d.Doping}
         `
          )
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY - 25}px`);
        tooltip.attr('data-year', d.Year);
      })
      .on('mouseout', (d: DatasetItem) => {
        tooltip.transition().duration(500).style('opacity', 0);
      });
  }

  createLegend() {
    const legend = this.svg
      ?.append('g')
      .attr('id', 'legend')
      .attr('width', 300)
      .attr(
        'transform',
        `translate(${this.width - this.margin.right}, ${this.height / 2})`
      );

    Object.values(this.legends).forEach((data, index) => {
      legend
        ?.append('text')
        .attr('x', 0)
        .attr('y', index * 25 + 12)
        .attr('text-anchor', 'end')
        .text(data.label)
        .style('font-size', '13px');
      legend
        ?.append('rect')
        .attr('x', 10)
        .attr('y', index * 25)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', data.color);
    });
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

  updateDataset() {
    this.dataset.forEach((d: DatasetItem) => {
      const timeString = d.Time as unknown as string;
      const timeFormat = timeString.split(':');
      const time = new Date(
        1970,
        0,
        1,
        0,
        Number(timeFormat[0]),
        Number(timeFormat[1])
      );
      d.Time = time;
    });
  }

  getTimeInSeconds(time: string) {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
  }
}
