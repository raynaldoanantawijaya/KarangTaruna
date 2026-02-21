import { NextResponse, NextRequest } from 'next/server';
import redis from '@/lib/redis';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        // Determine view type: 'weekly' (default, Mon-Sun) or 'yearly' (Jan-Dec)
        const type = searchParams.get('type') || 'weekly';

        const today = new Date().toISOString().split('T')[0];

        // Fetch current stats
        const totalVisits = await redis.get<number>('stats:visits:total') || 0;
        const dailyVisits = await redis.get<number>(`stats:visits:daily:${today}`) || 0;
        const uniqueVisitors = await redis.scard(`stats:unique:${today}`) || 0;

        // Fetch historical data for chart
        const chartData = [];

        if (type === 'yearly') {
            // Yearly View: Jan - Dec of current year
            const year = new Date().getFullYear();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agust', 'Sep', 'Okt', 'Nov', 'Des'];

            // Optimization: Fetch all days of the year in one go to aggregate (ensures sync with daily data)
            // Generate all daily keys for the current year
            const keys = [];
            const keyToMonthMap = new Map<string, number>(); // Map "YYYY-MM-DD" -> monthIndex (0-11)

            for (let m = 0; m < 12; m++) {
                const daysInMonth = new Date(year, m + 1, 0).getDate();
                for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    keys.push(`stats:visits:daily:${dateStr}`);
                    keyToMonthMap.set(`stats:visits:daily:${dateStr}`, m);
                }
            }

            // Batch fetch all daily stats for the year
            // Use mget for efficiency (Upstash/Redis handles hundreds of keys fine)
            const values = await redis.mget<number[]>(...keys);

            // Aggregate values by month
            const monthlyTotals = new Array(12).fill(0);
            keys.forEach((key, index) => {
                const val = values[index];
                if (val) {
                    const monthIndex = keyToMonthMap.get(key);
                    if (monthIndex !== undefined) {
                        monthlyTotals[monthIndex] += Number(val);
                    }
                }
            });

            // Map to chart format
            monthlyTotals.forEach((total, i) => {
                chartData.push({ label: months[i], visitors: total, key: `${year}-${i + 1}` });
            });
        } else {
            // Weekly View: Mon - Sun of current week
            const curr = new Date(); // get current date
            const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week + 1
            // Note: curr.getDay() returns 0 for Sunday. If today is Sunday (0), we need to subtract 6 days to get Monday.
            const dayOfWeek = curr.getDay() === 0 ? 7 : curr.getDay();
            const firstDay = new Date(curr.setDate(curr.getDate() - dayOfWeek + 1));

            const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

            for (let i = 0; i < 7; i++) {
                const d = new Date(firstDay);
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];
                const count = await redis.get<number>(`stats:visits:daily:${dateStr}`) || 0;
                chartData.push({ label: days[i], visitors: count, key: dateStr });
            }
        }

        return NextResponse.json({
            totalVisits,
            dailyVisits,
            uniqueVisitors,
            chartData
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
