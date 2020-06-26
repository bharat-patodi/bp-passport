import React, {useState, useEffect} from 'react'
import {View, Dimensions} from 'react-native'
import {format, addMonths} from 'date-fns'
import {
  VictoryChart,
  VictoryTheme,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryVoronoiContainer,
} from 'victory-native'

import {BloodPressure} from '../redux/blood-pressure/blood-pressure.models'
import {colors} from '../styles'
import {DateRange} from '../utils/dates'
import {BodyText} from './text'
import {VictoryGraphToolTipHelper} from './victory-chart-parts/victory-graph-tool-tip-helper'
import {ChartData} from './bp-history/chart-data'
import {GraphLoadingPlaceholder} from './victory-chart-parts/graph-loading-placeholder'
import {useIntl} from 'react-intl'
import {TitleBar} from './victory-chart-parts/title-bar'

type Props = {
  bps: BloodPressure[]
}

export const BpHistoryChart = ({bps}: Props) => {
  const intl = useIntl()

  const isBloodPressureHigh = (bpIn: BloodPressure) => {
    // A “High BP” is a BP whose Systolic value is greater than or equal to 140 or whose
    // Diastolic value is greater than or equal to 90. All other BPs are “Normal BP”.
    return bpIn.systolic >= 140 || bpIn.diastolic >= 90
  }

  const [chartData, setChartData] = useState<ChartData | null>(null)

  useEffect(() => {
    setChartData(new ChartData(bps))
  }, [bps])

  const getMaxThreshhold = (): number => {
    return 140
  }

  const getMinThreshhold = (): number => {
    return 90
  }

  const getMaxDomain = () => {
    if (!chartData) {
      throw new Error('Can not get max domain, not instance of chart data')
    }

    const threshhold = getMaxThreshhold()
    const difference = Math.round(threshhold / 10)
    let base = chartData.getMaxReading() ?? threshhold

    if (base < threshhold) {
      base = threshhold
    }

    return base + difference
  }

  const getMinDomain = () => {
    if (!chartData) {
      throw new Error('Can not get min domain, not instance of chart data')
    }

    const threshhold = getMinThreshhold()
    const difference = Math.round(threshhold / 10)
    let base = chartData.getMinReading() ?? threshhold

    if (base > threshhold) {
      base = threshhold
    }

    return base - difference
  }

  if (!chartData) {
    return <GraphLoadingPlaceholder />
  }

  return (
    <>
      {/* <TitleBar
        chartTitle={chartData.getTitle()}
        hasPreviousPeriod={chartData.hasPreviousPeriod()}
        moveToPreviousPeriodHandler={movePreviousPeriod}
        hasNextPeriod={chartData.hasNextPeriod()}
        moveToNextPeriodHandler={moveNextPeriod}
      /> */}
      <View
        style={{
          height: 260,
          borderColor: colors.grey3,
          borderLeftWidth: 1,
          borderTopWidth: 1,
          overflow: 'visible',
          position: 'relative',
        }}>
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            flexDirection: 'row',
            paddingLeft: 6,
          }}>
          {chartData.getAxisTickValues().map((value, index) => {
            return (
              <View
                key={index}
                style={{
                  flex: 1,
                  flexShrink: 0,
                }}>
                <BodyText
                  style={{
                    color: colors.grey0,
                    fontWeight: '500',
                    fontSize: 14,
                    lineHeight: 18,
                  }}>
                  {value.monthName}
                </BodyText>
                <BodyText
                  style={{
                    color: colors.grey2,
                    fontWeight: '500',
                    fontSize: 14,
                    lineHeight: 18,
                  }}>
                  {value.year}
                </BodyText>
              </View>
            )
          })}
          <View style={{width: 32}} />
        </View>
        <VictoryChart
          width={Dimensions.get('window').width - 24}
          height={310}
          maxDomain={{
            y: getMaxDomain(),
          }}
          minDomain={{
            y: getMinDomain(),
          }}
          style={{
            parent: {
              position: 'relative',
              left: -44,
              top: -44,
            },
          }}
          scale={{x: 'linear'}}
          theme={VictoryTheme.material}
          containerComponent={<VictoryVoronoiContainer radius={30} />}>
          <VictoryAxis
            tickCount={chartData.getAxisTickValues().length}
            tickFormat={(tick) => {
              return tick
            }}
            tickValues={chartData.getIndexValues()}
            style={{
              grid: {stroke: colors.grey3, strokeDasharray: 4},
              axis: {stroke: colors.grey3, opacity: 0},
              ticks: {opacity: 0},
              tickLabels: {opacity: 0},
            }}
          />
          <VictoryAxis
            orientation="left"
            style={{
              axis: {
                strokeWidth: 2,
                stroke: colors.white100,
              },
              tickLabels: {
                opacity: 0,
              },
              ticks: {
                opacity: 0,
              },
              grid: {
                opacity: 0,
              },
            }}
          />
          <VictoryAxis
            orientation="right"
            dependentAxis
            tickValues={[90, 140]}
            style={{
              grid: {stroke: colors.grey2, strokeDasharray: 4},
              axis: {stroke: colors.grey3, strokeDasharray: 4, strokeWidth: 0},
              ticks: {opacity: 0},
            }}
          />
          <VictoryLine
            data={chartData.getLineGraph(true)}
            style={{
              data: {
                stroke: colors.grey1,
                strokeWidth: 1,
              },
            }}
          />
          <VictoryLine
            data={chartData.getLineGraph(false)}
            style={{
              data: {
                stroke: colors.grey1,
                strokeWidth: 1,
              },
            }}
          />
          <VictoryScatter
            labelComponent={VictoryGraphToolTipHelper.getVictoryToolTip()}
            data={chartData.getScatterDataForGraph()}
            size={5}
            style={{
              data: {
                fill: ({datum}) =>
                  datum.showOutOfRange ? colors.red1 : colors.green1,
              },
            }}
          />
        </VictoryChart>
      </View>
    </>
  )
}
