import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
         BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import useStore, { KC_META, KC_ORDER } from '../store/useStore'
import api from '../utils/api'

export default function Analytics() {
  const navigate = useNavigate()
  const student  = useStore((s) => s.student)
  const [data,   setData]   = useState(null)
  const [loading,setLoading]= useState(true)

  useEffect(() => {
    if (!student) return
    api.get(`/analytics/${student.student_id}/`)
      .then((r) => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [student])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-400 animate-pulse">Loading analytics…</div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-400 mb-4">No data yet. Complete some questions first!</p>
        <button onClick={() => navigate('/learn')} className="btn-primary">Start Learning →</button>
      </div>
    </div>
  )

  const radarData = KC_ORDER.map((kc) => {
    const kd = data.kc_mastery?.find((k) => k.kc_id === kc)
    return {
      kc: kc.replace('KC-', 'KC'),
      mastery:  Math.round((kd?.mastery ?? 0.3) * 100),
      accuracy: Math.round((kd?.accuracy ?? 0) * 100),
    }
  })

  const barData = data.kc_mastery?.map((kc) => ({
    name:     kc.kc_id,
    mastery:  Math.round(kc.mastery * 100),
    accuracy: Math.round(kc.accuracy * 100),
    fill:     kc.is_mastered ? '#00FFAA' : '#00D4FF',
  })) || []

  return (
    <div className="min-h-screen p-6 page-enter">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-white">
            📊 Analytics
          </h1>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">← Back</button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Overall Mastery', value: `${Math.round(data.overall_mastery*100)}%`, color:'#00D4FF' },
            { label:'Total XP',        value: data.xp_total,    color:'#FFD700' },
            { label:'Level',           value: data.level,        color:'#8B5CF6' },
            { label:'Badges',          value: data.badges?.length || 0, color:'#00FFAA' },
          ].map((s) => (
            <div key={s.label} className="glass p-5 text-center">
              <div className="text-2xl font-display font-bold" style={{ color:s.color }}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Radar */}
          <div className="glass p-6">
            <h3 className="font-display font-semibold text-white mb-4">Mastery Radar</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="kc" tick={{ fill:'#94a3b8', fontSize:11 }} />
                <Radar name="Mastery"  dataKey="mastery"  stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.2} />
                <Radar name="Accuracy" dataKey="accuracy" stroke="#00FFAA" fill="#00FFAA" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan inline-block" /> Mastery</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-mint inline-block" /> Accuracy</span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="glass p-6">
            <h3 className="font-display font-semibold text-white mb-4">Mastery per KC</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barSize={18}>
                <XAxis dataKey="name" tick={{ fill:'#94a3b8', fontSize:10 }} />
                <YAxis domain={[0,100]} tick={{ fill:'#94a3b8', fontSize:10 }} />
                <Tooltip
                  contentStyle={{ background:'#1a2640', border:'1px solid #334155', borderRadius:8 }}
                  formatter={(v) => [`${v}%`]}
                />
                <Bar dataKey="mastery" radius={[4,4,0,0]}>
                  {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KC table */}
        <div className="glass p-6">
          <h3 className="font-display font-semibold text-white mb-4">Knowledge Component Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['KC','Name','Mastery','Accuracy','Attempts','Hints','Misconceptions','Status'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KC_ORDER.map((kcId) => {
                  const kd  = data.kc_mastery?.find((k) => k.kc_id === kcId)
                  const m   = kd?.mastery ?? 0.30
                  const acc = kd?.accuracy ?? 0
                  const miscCount = Object.values(kd?.misconceptions || {}).reduce((a,b)=>a+b,0)
                  return (
                    <tr key={kcId} className="border-b border-white/5 hover:bg-white/3 transition">
                      <td className="py-3 px-3"><span className="kc-badge">{kcId}</span></td>
                      <td className="py-3 px-3 text-slate-300 text-xs">{KC_META[kcId].name}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="mastery-bar-track w-16">
                            <div className="mastery-bar-fill"
                              style={{ width:`${Math.round(m*100)}%`, background: m>=0.85?'#00FFAA':'#00D4FF' }} />
                          </div>
                          <span className="font-mono text-xs" style={{ color: m>=0.85?'#00FFAA':'#00D4FF' }}>
                            {Math.round(m*100)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-300">{Math.round(acc*100)}%</td>
                      <td className="py-3 px-3 text-slate-400 text-xs">{kd?.attempts ?? 0}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs">{kd?.hints_used ?? 0}</td>
                      <td className="py-3 px-3 text-xs">
                        {miscCount > 0
                          ? <span className="text-coral">{miscCount} detected</span>
                          : <span className="text-slate-500">—</span>}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {m >= 0.85
                          ? <span className="text-mint font-semibold">✅ Mastered</span>
                          : kd?.attempts > 0
                          ? <span className="text-gold">In Progress</span>
                          : <span className="text-slate-500">Not Started</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
