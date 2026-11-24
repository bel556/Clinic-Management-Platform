// ============================================================================
// DATE & TIME UTILITY WITH MULTI-REGION / TIMEZONE SUPPORT
// Default: Algeria Time (Africa/Algiers, UTC+1)
// ----------------------------------------------------------------------------
// BACKEND API INTEGRATION POINT
// Function: api.clinic.getClinicTimezone()
// Endpoint: GET /api/v1/clinic/settings/timezone
// Description: Fetches clinic default operational timezone
// ----------------------------------------------------------------------------
// Function: api.clinic.setClinicTimezone(timezoneId)
// Endpoint: PATCH /api/v1/clinic/settings/timezone
// Description: Persists operational timezone across clinic reception desks
// ============================================================================

export const SUPPORTED_REGIONS = [
  { id: 'Africa/Algiers', name: 'Algeria (Algiers)', offset: 'UTC+1', flag: '🇩🇿' },
  { id: 'Europe/Paris', name: 'France (Paris)', offset: 'UTC+1', flag: '🇫🇷' },
  { id: 'Europe/London', name: 'UK (London)', offset: 'UTC+0', flag: '🇬🇧' },
  { id: 'Asia/Riyadh', name: 'Saudi Arabia (Riyadh)', offset: 'UTC+3', flag: '🇸🇦' },
  { id: 'Asia/Dubai', name: 'UAE (Dubai)', offset: 'UTC+4', flag: '🇦🇪' },
  { id: 'Africa/Cairo', name: 'Egypt (Cairo)', offset: 'UTC+2', flag: '🇪🇬' },
  { id: 'America/New_York', name: 'US Eastern (New York)', offset: 'UTC-5', flag: '🇺🇸' },
  { id: 'America/Chicago', name: 'US Central (Chicago)', offset: 'UTC-6', flag: '🇺🇸' },
  { id: 'America/Los_Angeles', name: 'US Pacific (Los Angeles)', offset: 'UTC-8', flag: '🇺🇸' },
  { id: 'Asia/Tokyo', name: 'Japan (Tokyo)', offset: 'UTC+9', flag: '🇯🇵' }
];

const TIMEZONE_STORAGE_KEY = 'curapulse_selected_timezone';
export const DEFAULT_TIMEZONE = 'Africa/Algiers';

// Get active timezone from localStorage or fallback to Algeria
export function getSelectedTimezone() {
  const saved = localStorage.getItem(TIMEZONE_STORAGE_KEY);
  if (saved && SUPPORTED_REGIONS.some(r => r.id === saved)) {
    return saved;
  }
  return DEFAULT_TIMEZONE;
}

// Persist active timezone and dispatch event so all components react
export function setSelectedTimezone(timezoneId) {
  localStorage.setItem(TIMEZONE_STORAGE_KEY, timezoneId);
  window.dispatchEvent(new CustomEvent('curapulse_timezone_changed', { detail: timezoneId }));
}

// Formats live date and time for Header: e.g. "Tue, Nov 24 • 07:19 PM"
export function formatHeaderDateTime(date = new Date(), timezone = getSelectedTimezone()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const parts = formatter.formatToParts(date);
    const map = {};
    parts.forEach(p => { map[p.type] = p.value; });

    const weekday = map.weekday || '';
    const month = map.month || '';
    const day = map.day || '';
    const hour = map.hour || '';
    const minute = map.minute || '';
    const dayPeriod = map.dayPeriod || '';

    return `${weekday}, ${month} ${day} • ${hour}:${minute} ${dayPeriod}`;
  } catch {
    return date.toLocaleString();
  }
}

// Returns YYYY-MM-DD for today in the given timezone
export function getTodayDateString(timezone = getSelectedTimezone()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date()); // Outputs YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

// Formats a date string into human friendly format: e.g. "24 Nov 2026"
export function formatDisplayDate(dateInput, timezone = getSelectedTimezone()) {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

// Returns dynamic current week days (MON-FRI) for DoctorAvailability & TimeSlotGrid
export function getCurrentWeekDays(timezone = getSelectedTimezone()) {
  const todayStr = getTodayDateString(timezone);
  const now = new Date(todayStr + 'T12:00:00Z');
  const dayOfWeek = now.getUTCDay(); // 0: Sun, 1: Mon, ... 6: Sat
  
  // Calculate Monday of the current week
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diffToMon);

  const days = [];
  const dayKeys = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    const dayNum = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      key: dayKeys[i],
      label: `${dayKeys[i]} ${dayNum}`,
      date: dateStr
    });
  }

  // Calculate week number of the year
  const firstJan = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const daysPassed = Math.floor((now - firstJan) / 86400000);
  const weekNum = Math.ceil((daysPassed + firstJan.getUTCDay() + 1) / 7);

  return {
    week: `WEEK ${weekNum}`,
    days
  };
}

// Helper to parse date string & time string into a Date object
export function parseVisitDateTime(dateStr, timeStr) {
  if (!dateStr) return null;

  try {
    // If dateStr is like "2026-11-24"
    let year, month, day;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        year = parsed.getFullYear();
        month = parsed.getMonth();
        day = parsed.getDate();
      } else {
        return null;
      }
    }

    let hours = 10;
    let minutes = 0;

    if (timeStr) {
      const timeClean = timeStr.trim().toUpperCase();
      const match = timeClean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const meridiem = match[3];
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
      }
    }

    return new Date(year, month, day, hours, minutes, 0);
  } catch {
    return null;
  }
}

// Checks if a visit's scheduled date and time has passed relative to the current time
export function isPastVisitDateTime(dateStr, timeStr, timezone = getSelectedTimezone()) {
  const visitDate = parseVisitDateTime(dateStr, timeStr);
  if (!visitDate) return false;

  try {
    // Get current time formatted in selected timezone
    const nowInTzStr = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date());

    const nowInTz = new Date(nowInTzStr);
    return visitDate.getTime() < nowInTz.getTime();
  } catch {
    return visitDate.getTime() < Date.now();
  }
}
