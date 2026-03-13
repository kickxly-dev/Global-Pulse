'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Filter, ZoomIn, ZoomOut, RefreshCw, Lightbulb, ChevronDown } from 'lucide-react'

interface DataPoint {
  label: string
  value: number
  previousValue?: number
  change?: number
}

interface ChartData {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'area'
  data: DataPoint[]
  source: string
  lastUpdated: string
  historicalContext?: string
}

interface InteractiveDataProps {
  article?: {
    title: string
    content: string
  }
}

export default function InteractiveData({ article }: InteractiveDataProps) {
  const [charts, setCharts] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'1y' | '5y' | '10y'>('5y')

  const generateCharts = () => {
    setLoading(true)
    
    setTimeout(() => {
      const mockCharts: ChartData[] = [
        {
          id: '1',
          title: 'Unemployment Rate',
          type: 'line',
          data: [
            { label: '2019', value: 3.7 },
            { label: '2020', value: 8.1 },
            { label: '2021', value: 5.4 },
            { label: '2022', value: 3.6 },
            { label: '2023', value: 3.5 },
            { label: '2024', value: 3.4 }
          ],
          source: 'Bureau of Labor Statistics',
          lastUpdated: '2 hours ago',
          historicalContext: 'Unemployment peaked during the pandemic but has since recovered to historic lows.'
        },
        {
          id: '2',
          title: 'Carbon Emissions (Million Tons)',
          type: 'bar',
          data: [
            { label: 'US', value: 4500, previousValue: 4800, change: -6 },
            { label: 'China', value: 10500, previousValue: 10200, change: 3 },
            { label: 'EU', value: 2800, previousValue: 3100, change: -10 },
            { label: 'India', value: 2400, previousValue: 2200, change: 9 },
            { label: 'Japan', value: 1000, previousValue: 1050, change: -5 }
          ],
          source: 'IEA Global Report',
          lastUpdated: '1 day ago',
          historicalContext: 'Developed nations showing decline while emerging economies increase.'
        },
        {
          id: '3',
          title: 'Market Performance',
          type: 'area',
          data: [
            { label: 'Jan', value: 4200 },
            { label: 'Feb', value: 4350 },
            { label: 'Mar', value: 4100 },
            { label: 'Apr', value: 4400 },
            { label: 'May', value: 4650 },
            { label: 'Jun', value: 4800 }
          ],
          source: 'S&P 500 Index',
          lastUpdated: 'Real-time',
          historicalContext: 'Market showing steady growth despite volatility concerns.'
        }
      ]
      
      setCharts(mockCharts)
      setLoading(false)
      setGenerated(true)
    }, 1500)
  }

  const maxValue = (data: DataPoint[]) => Math.max(...data.map(d => d.value))
  const minValue = (data: DataPoint[]) => Math.min(...data.map(d => d.value))

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-white/40'
    return change >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getChangeIcon = (change?: number) => {
    if (!change) return null
    return change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
  }

  return (
    <div className="bg-gradient-to-r from-lime-500/10 to-green-500/10 border border-lime-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-lime-400" />
          <h3 className="font-semibold">Data Explorer</h3>
        </div>
        <span className="text-xs text-white/40">Interactive charts</span>
      </div>

      {!generated ? (
        <button
          onClick={generateCharts}
          disabled={loading || !article}
          className="w-full py-3 bg-gradient-to-r from-lime-500 to-green-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 text-black"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Extracting data...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Explore the Data
            </>
          )}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Time Range Filter */}
          <div className="flex gap-2">
            {(['1y', '5y', '10y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {range === '1y' ? '1 Year' : range === '5y' ? '5 Years' : '10 Years'}
              </button>
            ))}
          </div>

          {/* Charts */}
          <div className="space-y-3">
            {charts.map((chart) => (
              <motion.div
                key={chart.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedChart === chart.id
                    ? 'bg-lime-500/20 border-lime-500/30'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
                onClick={() => setSelectedChart(selectedChart === chart.id ? null : chart.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium">{chart.title}</h4>
                    <p className="text-xs text-white/40">{chart.source} • {chart.lastUpdated}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-white/10 rounded text-xs capitalize">{chart.type}</span>
                </div>

                {/* Bar Chart */}
                {chart.type === 'bar' && (
                  <div className="space-y-2">
                    {chart.data.map((point, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-12 truncate">{point.label}</span>
                        <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(point.value / maxValue(chart.data)) * 100}%` }}
                            transition={{ delay: i * 0.05 }}
                            className="h-full bg-gradient-to-r from-lime-500 to-green-500 rounded-full"
                          />
                        </div>
                        <span className="text-xs w-12 text-right">{point.value.toLocaleString()}</span>
                        {point.change !== undefined && (
                          <span className={`flex items-center gap-0.5 text-xs ${getChangeColor(point.change)}`}>
                            {getChangeIcon(point.change)}
                            {Math.abs(point.change)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Line Chart */}
                {chart.type === 'line' && (
                  <div className="relative h-20 flex items-end gap-1">
                    {chart.data.map((point, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${((point.value - minValue(chart.data)) / (maxValue(chart.data) - minValue(chart.data))) * 60 + 20}%` }}
                          transition={{ delay: i * 0.05 }}
                          className="w-full bg-gradient-to-t from-lime-500/50 to-lime-500 rounded-t"
                        />
                        <span className="text-xs text-white/40 mt-1">{point.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Area Chart */}
                {chart.type === 'area' && (
                  <div className="relative h-20 flex items-end gap-1">
                    {chart.data.map((point, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(point.value / maxValue(chart.data)) * 100}%` }}
                          transition={{ delay: i * 0.05 }}
                          className="w-full bg-gradient-to-t from-green-500/30 to-lime-500/80 rounded-t"
                        />
                        <span className="text-xs text-white/40 mt-1">{point.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedChart === chart.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-3 h-3 text-lime-400" />
                        <span className="text-xs text-lime-400">Historical Context</span>
                      </div>
                      <p className="text-xs text-white/60 mb-3">{chart.historicalContext}</p>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 py-1.5 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                          <Filter className="w-3 h-3" />
                          Filter
                        </button>
                        <button className="flex-1 py-1.5 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                          <ZoomIn className="w-3 h-3" />
                          Expand
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => setGenerated(false)}
            className="w-full py-2 text-xs text-white/40 hover:text-white transition-colors"
          >
            Reset charts
          </button>
        </motion.div>
      )}
    </div>
  )
}
