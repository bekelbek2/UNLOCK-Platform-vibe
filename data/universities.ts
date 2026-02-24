export type ScholarshipType = 'full-ride' | 'full-tuition' | 'partial' | 'none';

export interface University {
    id: string;
    name: string;
    country: string;
    rank: number;
    tuition: string;
    acceptanceRate: string;
    deadline: string;
    scholarshipType: ScholarshipType;
    logoUrl: string;
}

export const universities: University[] = [
    {
        id: '1',
        name: 'Perfekt University',
        country: 'Uzbekistan',
        rank: 30,
        tuition: '$3,000',
        acceptanceRate: '2%',
        deadline: 'March 1, 2026',
        scholarshipType: 'full-ride',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/National_University_of_Uzbekistan_logo.png/200px-National_University_of_Uzbekistan_logo.png',
    },
    {
        id: '2',
        name: 'Harvard University',
        country: 'United States',
        rank: 1,
        tuition: '$59,076',
        acceptanceRate: '3.2%',
        deadline: 'January 1, 2026',
        scholarshipType: 'full-ride',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Harvard_University_shield.png/200px-Harvard_University_shield.png',
    },
    {
        id: '3',
        name: 'University of Oxford',
        country: 'United Kingdom',
        rank: 3,
        tuition: '£9,535',
        acceptanceRate: '14.6%',
        deadline: 'October 15, 2025',
        scholarshipType: 'full-tuition',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/200px-Oxford-University-Circlet.svg.png',
    },
    {
        id: '4',
        name: 'National University of Singapore',
        country: 'Singapore',
        rank: 8,
        tuition: '$17,550',
        acceptanceRate: '6%',
        deadline: 'February 21, 2026',
        scholarshipType: 'partial',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/NUS_coat_of_arms.svg/200px-NUS_coat_of_arms.svg.png',
    },
    {
        id: '5',
        name: 'MIT',
        country: 'United States',
        rank: 2,
        tuition: '$61,990',
        acceptanceRate: '3.9%',
        deadline: 'January 5, 2026',
        scholarshipType: 'full-ride',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png',
    },
    {
        id: '6',
        name: 'ETH Zurich',
        country: 'Switzerland',
        rank: 7,
        tuition: '$1,500',
        acceptanceRate: '27%',
        deadline: 'December 15, 2025',
        scholarshipType: 'full-tuition',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/ETH_Z%C3%BCrich_wordmark.svg/200px-ETH_Z%C3%BCrich_wordmark.svg.png',
    },
    {
        id: '7',
        name: 'University of Tokyo',
        country: 'Japan',
        rank: 12,
        tuition: '$5,100',
        acceptanceRate: '34%',
        deadline: 'November 30, 2025',
        scholarshipType: 'partial',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/The_University_of_Tokyo_logo.svg/200px-The_University_of_Tokyo_logo.svg.png',
    },
    {
        id: '8',
        name: 'University of Cambridge',
        country: 'United Kingdom',
        rank: 5,
        tuition: '£9,340',
        acceptanceRate: '18%',
        deadline: 'October 15, 2025',
        scholarshipType: 'none',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Coat_of_Arms_of_the_University_of_Cambridge.svg/200px-Coat_of_Arms_of_the_University_of_Cambridge.svg.png',
    },
];
