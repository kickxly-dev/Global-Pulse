'use client'

import { useState, useEffect } from 'react'
import { UserPreferences } from '@/types/news'
import { Volume2, VolumeX, Moon, Clock } from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_PREFERENCES: UserPreferences = {
  notificationsEnabled: false,
  soundEnabled: true,
  breakingNewsSound: '/sounds/breaking.mp3',
  localAlertsSound: '/sounds/alert.mp3',
  personalTopicsSound: '/sounds/notification.mp3',
  preferredTopics: [],
  preferredCountries: ['us'],
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  autoRefresh: true,
  refreshInterval: 30000,
}

export default function Settings() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) })
    }
  }, [])

  const savePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs }
    setPreferences(updated)
    localStorage.setItem('userPreferences', JSON.stringify(updated))
    toast.success('Settings saved')
  }

  return (
    <div className="cyber-card">
      <h2 className="text-xl font-bold font-cyber text-cyber-blue mb-6">Settings</h2>

      <div className="space-y-6">
        {/* Sound Settings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {preferences.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-cyber-blue" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
              <h3 className="font-semibold">Notification Sounds</h3>
            </div>
            <button
              onClick={() => savePreferences({ soundEnabled: !preferences.soundEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.soundEnabled ? 'bg-cyber-blue' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.soundEnabled && (
            <div className="space-y-3 ml-7">
              <div>
                <label className="text-sm text-gray-400">Breaking News Sound</label>
                <select
                  value={preferences.breakingNewsSound}
                  onChange={(e) => savePreferences({ breakingNewsSound: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-cyber-dark border border-cyber-blue/30 rounded text-sm"
                >
                  <option value="/sounds/breaking.mp3">Alert (Default)</option>
                  <option value="/sounds/urgent.mp3">Urgent</option>
                  <option value="/sounds/siren.mp3">Siren</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400">Local Alerts Sound</label>
                <select
                  value={preferences.localAlertsSound}
                  onChange={(e) => savePreferences({ localAlertsSound: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-cyber-dark border border-cyber-blue/30 rounded text-sm"
                >
                  <option value="/sounds/alert.mp3">Chime (Default)</option>
                  <option value="/sounds/bell.mp3">Bell</option>
                  <option value="/sounds/ding.mp3">Ding</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400">Personal Topics Sound</label>
                <select
                  value={preferences.personalTopicsSound}
                  onChange={(e) => savePreferences({ personalTopicsSound: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-cyber-dark border border-cyber-blue/30 rounded text-sm"
                >
                  <option value="/sounds/notification.mp3">Soft (Default)</option>
                  <option value="/sounds/gentle.mp3">Gentle</option>
                  <option value="/sounds/subtle.mp3">Subtle</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Quiet Hours */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Moon className="w-5 h-5 text-cyber-purple" />
              <h3 className="font-semibold">Quiet Hours</h3>
            </div>
            <button
              onClick={() => savePreferences({ quietHoursEnabled: !preferences.quietHoursEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.quietHoursEnabled ? 'bg-cyber-purple' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.quietHoursEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-3 ml-7">
              <div>
                <label className="text-sm text-gray-400">Start</label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => savePreferences({ quietHoursStart: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-cyber-dark border border-cyber-blue/30 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">End</label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => savePreferences({ quietHoursEnd: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-cyber-dark border border-cyber-blue/30 rounded text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Auto Refresh */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-cyber-green" />
              <h3 className="font-semibold">Auto Refresh</h3>
            </div>
            <button
              onClick={() => savePreferences({ autoRefresh: !preferences.autoRefresh })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.autoRefresh ? 'bg-cyber-green' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.autoRefresh && (
            <div className="ml-7">
              <label className="text-sm text-gray-400">Refresh Interval (seconds)</label>
              <input
                type="number"
                min="10"
                max="300"
                value={preferences.refreshInterval / 1000}
                onChange={(e) => savePreferences({ refreshInterval: parseInt(e.target.value) * 1000 })}
                className="w-full mt-1 px-3 py-2 bg-cyber-dark border border-cyber-blue/30 rounded text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
