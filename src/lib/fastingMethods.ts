export const fastingTypes = [
    { name: '16:8 Intermittent Fasting', duration: 16 * 60 * 60, icon: '🕰️' },
    { name: '18:6 Intermittent Fasting', duration: 18 * 60 * 60, icon: '⏳' },
    { name: '20:4 Intermittent Fasting', duration: 20 * 60 * 60, icon: '⌛' },
    { name: 'OMAD (One Meal a Day)', duration: 23 * 60 * 60, icon: '🍽️' },
    { name: 'Ramadan', duration: 14 * 60 * 60, icon: '🌙' },
    { name: 'Shawwal (6 days)', duration: 14 * 60 * 60, icon: '📅' },
    { name: 'Muharram (Ashura)', duration: 24 * 60 * 60, icon: '🕌' },
    { name: 'Dhul-Hijjah (9 days)', duration: 14 * 60 * 60, icon: '🐑' },
    { name: 'Custom', duration: 0, icon: '✏️' },
];

export interface FastingType {
    name: string;
    duration: number;
    icon: string;
}
