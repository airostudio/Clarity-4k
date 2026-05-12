const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash('clarity2024', 10)
  await prisma.user.upsert({
    where: { email: 'admin@clarity4k.com' },
    update: {},
    create: {
      email: 'admin@clarity4k.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'manager@clarity4k.com' },
    update: {},
    create: {
      email: 'manager@clarity4k.com',
      name: 'Sarah Mitchell',
      password: await bcrypt.hash('manager2024', 10),
      role: 'MANAGER',
    },
  })

  // Agency settings
  await prisma.agencySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      agencyName: 'Clarity 4K',
      currency: 'USD',
      defaultFee: 20,
      contactEmail: 'info@clarity4k.com',
      contactPhone: '+1 (555) 000-0001',
    },
  })

  // Talent roster
  const talents = [
    {
      name: 'Alexa Monroe',
      stageName: 'AlexaM',
      email: 'alexa@clarity4k.com',
      phone: '+1 (555) 100-0001',
      nationality: 'American',
      bio: 'Fitness and lifestyle creator with a highly engaged audience. Specialises in wellness content.',
      avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=alexa',
      status: 'ACTIVE',
      tier: 'ELITE',
      agencyFee: 20,
      tags: 'fitness,lifestyle,wellness',
      platformLinks: JSON.stringify({ onlyfans: 'https://onlyfans.com/alexam', instagram: 'https://instagram.com/alexam' }),
      socialLinks: JSON.stringify({ twitter: '@alexam', tiktok: '@alexam_official' }),
    },
    {
      name: 'Brianna Cole',
      stageName: 'BriCole',
      email: 'brianna@clarity4k.com',
      phone: '+1 (555) 100-0002',
      nationality: 'Canadian',
      bio: 'Fashion-forward creator blending high-end style with authentic storytelling.',
      avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=brianna',
      status: 'ACTIVE',
      tier: 'PREMIUM',
      agencyFee: 20,
      tags: 'fashion,style,luxury',
      platformLinks: JSON.stringify({ onlyfans: 'https://onlyfans.com/bricole', instagram: 'https://instagram.com/bricole' }),
      socialLinks: JSON.stringify({ twitter: '@bricole', tiktok: '@bricole_style' }),
    },
    {
      name: 'Camille Dupont',
      stageName: 'CamD',
      email: 'camille@clarity4k.com',
      phone: '+1 (555) 100-0003',
      nationality: 'French',
      bio: 'Art and photography enthusiast creating visually stunning editorial content.',
      avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=camille',
      status: 'ACTIVE',
      tier: 'PREMIUM',
      agencyFee: 18,
      tags: 'art,photography,editorial',
      platformLinks: JSON.stringify({ onlyfans: 'https://onlyfans.com/camd', instagram: 'https://instagram.com/camd' }),
      socialLinks: JSON.stringify({ twitter: '@camd_art' }),
    },
    {
      name: 'Diana Lee',
      stageName: 'DianaL',
      email: 'diana@clarity4k.com',
      phone: '+1 (555) 100-0004',
      nationality: 'Australian',
      bio: 'Lifestyle and travel creator known for sun-soaked, aspirational content.',
      avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=diana',
      status: 'ACTIVE',
      tier: 'STANDARD',
      agencyFee: 20,
      tags: 'travel,lifestyle,outdoors',
      platformLinks: JSON.stringify({ onlyfans: 'https://onlyfans.com/diana', instagram: 'https://instagram.com/dianaleeofficial' }),
      socialLinks: JSON.stringify({ tiktok: '@dianalee_travel' }),
    },
    {
      name: 'Elena Vasquez',
      stageName: 'ElenaV',
      email: 'elena@clarity4k.com',
      phone: '+1 (555) 100-0005',
      nationality: 'Spanish',
      bio: 'Dance and performance creator with viral short-form video presence.',
      avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=elena',
      status: 'ACTIVE',
      tier: 'ELITE',
      agencyFee: 20,
      tags: 'dance,performance,viral',
      platformLinks: JSON.stringify({ onlyfans: 'https://onlyfans.com/elenav', tiktok: 'https://tiktok.com/@elenav_dance' }),
      socialLinks: JSON.stringify({ instagram: 'elenav_official', twitter: '@elenav' }),
    },
    {
      name: 'Fiona Walsh',
      stageName: 'FiW',
      email: 'fiona@clarity4k.com',
      phone: '+1 (555) 100-0006',
      nationality: 'Irish',
      bio: 'Comedy and lifestyle content creator building a loyal, engaged community.',
      avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=fiona',
      status: 'PENDING',
      tier: 'STANDARD',
      agencyFee: 20,
      tags: 'comedy,lifestyle,community',
      platformLinks: JSON.stringify({ instagram: 'https://instagram.com/fionaw' }),
      socialLinks: JSON.stringify({ tiktok: '@fionaw_comedy' }),
    },
  ]

  const createdTalents = []
  for (const t of talents) {
    const talent = await prisma.talent.upsert({
      where: { email: t.email },
      update: {},
      create: t,
    })
    createdTalents.push(talent)
  }

  // Earnings seed data (last 6 months)
  const platforms = ['OnlyFans', 'Instagram', 'TikTok', 'Other']
  const now = new Date()
  for (const talent of createdTalents.slice(0, 5)) {
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const base = talent.tier === 'ELITE' ? 8000 : talent.tier === 'PREMIUM' ? 4000 : 1500
      await prisma.earning.create({
        data: {
          talentId: talent.id,
          platform: 'OnlyFans',
          amount: base + Math.floor(Math.random() * base * 0.5),
          month: d.getMonth() + 1,
          year: d.getFullYear(),
          description: 'Monthly subscription revenue',
        },
      })
      if (i < 3) {
        await prisma.earning.create({
          data: {
            talentId: talent.id,
            platform: platforms[Math.floor(Math.random() * 3)],
            amount: Math.floor(Math.random() * 2000) + 200,
            month: d.getMonth() + 1,
            year: d.getFullYear(),
            description: 'Brand deal / sponsorship',
          },
        })
      }
    }
  }

  // Expenses seed data
  const categories = ['Shoot', 'Travel', 'Equipment', 'Marketing', 'Other']
  for (const talent of createdTalents.slice(0, 4)) {
    for (let i = 0; i < 4; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 15)
      await prisma.expense.create({
        data: {
          talentId: talent.id,
          category: categories[Math.floor(Math.random() * categories.length)],
          amount: Math.floor(Math.random() * 1200) + 100,
          date: d,
          description: 'Monthly operational expense',
        },
      })
    }
  }

  // Campaigns
  const campaigns = [
    {
      title: 'Summer Launch 2024',
      description: 'High-impact summer content push across all platforms to drive new subscriptions.',
      type: 'LAUNCH',
      status: 'COMPLETED',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      budget: 5000,
      spent: 4750,
      goal: 'Grow subscriber base by 25%',
      platform: 'OnlyFans',
      metrics: JSON.stringify({ impressions: 320000, clicks: 18400, conversions: 2100, revenue: 52000 }),
    },
    {
      title: 'Elite Creator Promo — Q4',
      description: 'Exclusive promotional campaign targeting premium subscribers with elite tier content bundles.',
      type: 'PROMOTION',
      status: 'ACTIVE',
      startDate: new Date('2024-10-01'),
      budget: 8000,
      spent: 3200,
      goal: 'Increase ARPU by 15%',
      platform: 'OnlyFans',
      metrics: JSON.stringify({ impressions: 145000, clicks: 9200, conversions: 870, revenue: 28000 }),
    },
    {
      title: 'Instagram Reach Expansion',
      description: 'Cross-platform push to grow Instagram followings and funnel traffic to OnlyFans.',
      type: 'SOCIAL_PUSH',
      status: 'ACTIVE',
      startDate: new Date('2024-11-01'),
      budget: 3000,
      spent: 1100,
      goal: 'Add 50k Instagram followers across roster',
      platform: 'Instagram',
      metrics: JSON.stringify({ impressions: 210000, clicks: 7800, conversions: 430, revenue: 8500 }),
    },
    {
      title: 'Holiday Season Collab',
      description: 'Collaborative limited-time content series featuring top-tier talent for the holiday period.',
      type: 'COLLAB',
      status: 'DRAFT',
      startDate: new Date('2024-12-15'),
      endDate: new Date('2025-01-05'),
      budget: 6000,
      spent: 0,
      goal: 'Drive 500 new subscriptions in 3 weeks',
      platform: 'OnlyFans',
      metrics: null,
    },
    {
      title: 'New Talent Onboarding — Fiona',
      description: 'Launch campaign for newest talent Fiona Walsh, building initial audience and subscriber base.',
      type: 'LAUNCH',
      status: 'DRAFT',
      startDate: new Date('2025-01-10'),
      budget: 2500,
      spent: 0,
      goal: 'Reach 500 subscribers in first 30 days',
      platform: 'OnlyFans',
      metrics: null,
    },
  ]

  const createdCampaigns = []
  for (const c of campaigns) {
    const campaign = await prisma.campaign.create({ data: c })
    createdCampaigns.push(campaign)
  }

  // Link talent to campaigns
  await prisma.campaignTalent.createMany({
    data: [
      { campaignId: createdCampaigns[0].id, talentId: createdTalents[0].id },
      { campaignId: createdCampaigns[0].id, talentId: createdTalents[1].id },
      { campaignId: createdCampaigns[0].id, talentId: createdTalents[4].id },
      { campaignId: createdCampaigns[1].id, talentId: createdTalents[0].id },
      { campaignId: createdCampaigns[1].id, talentId: createdTalents[4].id },
      { campaignId: createdCampaigns[2].id, talentId: createdTalents[1].id },
      { campaignId: createdCampaigns[2].id, talentId: createdTalents[2].id },
      { campaignId: createdCampaigns[2].id, talentId: createdTalents[3].id },
      { campaignId: createdCampaigns[3].id, talentId: createdTalents[0].id },
      { campaignId: createdCampaigns[3].id, talentId: createdTalents[4].id },
      { campaignId: createdCampaigns[4].id, talentId: createdTalents[5].id },
    ],
  })

  // Notes
  await prisma.note.createMany({
    data: [
      { talentId: createdTalents[0].id, content: 'Alexa is ready for the next shoot — schedule confirmed for Dec 3rd.', author: 'Sarah Mitchell' },
      { talentId: createdTalents[0].id, content: 'Brand deal with NutriCo finalised — $3,200 deliverable due Dec 10.', author: 'Admin User' },
      { talentId: createdTalents[1].id, content: 'Discussed raising tier to ELITE — review after Q4 numbers.', author: 'Sarah Mitchell' },
      { talentId: createdTalents[4].id, content: 'Elena is performing exceptionally — viral TikTok drove 12k new follows this week.', author: 'Sarah Mitchell' },
      { talentId: createdTalents[5].id, content: 'Fiona onboarding in progress — paperwork sent, awaiting signed contract.', author: 'Admin User' },
    ],
  })

  console.log('✅ Seed complete')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
