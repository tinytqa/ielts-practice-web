export interface StudySessionEvent {
  id?: string;
  summary: string;
  description: string;
  skill: 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
  start_time: string; // e.g., "2026-08-07T08:00:00"
  end_time: string;   // e.g., "2026-08-07T09:30:00"
  reminders_minutes?: number[]; // e.g., [15, 30]
  synced?: boolean;
  google_event_id?: string;
  html_link?: string;
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: StudySessionEvent,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh'
): Promise<{ id: string; htmlLink: string }> {
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  // Map skills to calendar event colors
  // 10: Basil (Green), 9: Blueberry (Blue), 6: Tangerine (Orange), 11: Flamingo (Pink/Red)
  const colorMap: Record<string, string> = {
    READING: '9',
    LISTENING: '10',
    WRITING: '6',
    SPEAKING: '11'
  };

  const payload = {
    summary: event.summary,
    description: `${event.description}\n\n🎓 Được tạo tự động bởi IELTS AI Master - Lộ trình học cá nhân hóa.`,
    start: {
      dateTime: new Date(event.start_time).toISOString(),
      timeZone: timeZone
    },
    end: {
      dateTime: new Date(event.end_time).toISOString(),
      timeZone: timeZone
    },
    colorId: colorMap[event.skill] || '10',
    reminders: {
      useDefault: false,
      overrides: (event.reminders_minutes || [15, 30]).map((min) => ({
        method: 'popup',
        minutes: min
      }))
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Google Calendar Error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    htmlLink: data.htmlLink
  };
}

export async function syncMultipleEventsToCalendar(
  accessToken: string,
  events: StudySessionEvent[],
  onProgress?: (index: number, total: number) => void
): Promise<StudySessionEvent[]> {
  const updatedEvents: StudySessionEvent[] = [];

  for (let i = 0; i < events.length; i++) {
    const evt = events[i];
    if (onProgress) onProgress(i + 1, events.length);

    try {
      const res = await createGoogleCalendarEvent(accessToken, evt);
      updatedEvents.push({
        ...evt,
        synced: true,
        google_event_id: res.id,
        html_link: res.htmlLink
      });
    } catch (err) {
      console.error(`Failed to sync event "${evt.summary}":`, err);
      updatedEvents.push({
        ...evt,
        synced: false
      });
    }
  }

  return updatedEvents;
}
