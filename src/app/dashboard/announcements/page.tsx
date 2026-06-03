import { Bell, Pin } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { formatRelativeTime, formatDate } from '@/lib/utils'

async function getAnnouncements() {
  const { data } = await supabaseAdmin
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
  return data || []
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell size={24} className="text-nuass-green" /> Announcements
        </h1>
        <p className="text-gray-500 text-sm mt-1">{announcements.length} announcements</p>
      </div>

      {announcements.length === 0 ? (
        <div className="nuass-card p-12 text-center text-gray-400">
          <Bell size={48} className="mx-auto mb-3 opacity-20" />
          <p>No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann: any) => (
            <div key={ann.id} className={`nuass-card p-6 ${ann.is_pinned ? 'border-nuass-gold/30 bg-amber-50/20' : ''}`}>
              <div className="flex items-start gap-3 mb-3">
                {ann.is_pinned && <Pin size={16} className="text-nuass-gold flex-shrink-0 mt-1" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                    {ann.is_pinned && (
                      <span className="text-xs font-semibold text-nuass-gold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">Pinned</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Posted by <span className="font-medium text-gray-600">{ann.created_by}</span> · {formatRelativeTime(ann.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
