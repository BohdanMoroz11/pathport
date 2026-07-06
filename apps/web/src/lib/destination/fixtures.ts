import type {
  CitizenshipIdentity,
  CountryBase,
  DestinationIdentity,
  DestinationProfile,
  EntryBrief,
  EntryProfile,
  FamilyProfile,
  FitSignal,
  GlanceMetric,
  LanguageForReader,
  LivingProfile,
  QuickFact,
  WorkProfile,
} from "./types.js";

/**
 * Throwaway demo data for the S3 reference page, matching the demo seed's codes
 * (citizenships USA/UKR, destinations DE/PT/ES). FE-first: the page renders from
 * this until the shape is locked and pushed down into the real stack. The
 * Ukraine → Germany pairing is the fully authored one (it is the design
 * concept's subject); other pairings are synthesized so navigation never
 * dead-ends while the deeper views are built out.
 */

const CITIZENSHIPS: Record<string, CitizenshipIdentity> = {
  USA: { code: "USA", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  UKR: { code: "UKR", name: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}" },
};

type DestinationEntry = DestinationIdentity & {
  quickFacts: QuickFact[];
  /** Deep country facts for the Country view; only DE is authored so far. */
  country?: CountryBase;
  /** Cost-of-living facts for the Living view; only DE is authored so far. */
  living?: LivingProfile;
  /** Work & income facts for the Work view; only DE is authored so far. */
  work?: WorkProfile;
  /** Family & pets facts for the Family view; only DE is authored so far. */
  family?: FamilyProfile;
};

const DESTINATIONS: Record<string, DestinationEntry> = {
  DE: {
    code: "DE",
    name: "Germany",
    flag: "\u{1F1E9}\u{1F1EA}",
    region: "Western Europe",
    tagline: "Western Europe · strong labour market · EU member",
    description:
      "Germany is the European Union's largest economy and most populous member state, anchoring central Europe with a deep industrial and engineering base and a skills shortage that keeps demand for foreign workers high. It runs a social-market system — universal healthcare, tuition-free public universities, generous parental leave, and strong worker protections — paid for by high taxes and social contributions. Life is orderly and well-served: reliable public transport, walkable cities, and broad legal protections, balanced against a famously thorough bureaucracy that rewards patience and paperwork. German still does most of the day-to-day heavy lifting, though English carries you a long way in larger cities, universities, and the tech sector. The climate is temperate — grey, mild winters and warm summers — and the country is well connected to the rest of Europe by rail and air.",
    quickFacts: [
      { label: "Capital", value: "Berlin" },
      { label: "Language", value: "German" },
      { label: "Currency", value: "EUR €" },
      { label: "Population", value: "84M" },
      { label: "EU member", value: "Yes" },
    ],
    country: {
      geography: {
        location:
          "Central Europe, sharing land borders with nine countries — more than any other EU state — from the North and Baltic Seas down to the Alps.",
        borders: [
          "Poland",
          "Czechia",
          "Austria",
          "Switzerland",
          "France",
          "Luxembourg",
          "Belgium",
          "Netherlands",
          "Denmark",
        ],
        stats: [
          { label: "Area", value: "357,600 km²", note: "≈ Montana" },
          { label: "Terrain", value: "Lowlands → Alps", note: "flat north, alpine south" },
          { label: "Coastline", value: "North & Baltic Seas" },
          { label: "Time zone", value: "CET (UTC+1)" },
        ],
        cities: [
          { label: "Berlin", value: 3.7, note: "capital" },
          { label: "Hamburg", value: 1.9 },
          { label: "Munich", value: 1.5 },
          { label: "Cologne", value: 1.1 },
          { label: "Frankfurt", value: 0.77, note: "financial hub" },
        ],
        images: [
          { caption: "Berlin skyline along the Spree" },
          { caption: "The Bavarian Alps in the south" },
          { caption: "North Sea coast & Wadden tidal flats" },
          { caption: "Rhine valley vineyards" },
        ],
        climate: {
          summary:
            "Temperate, sitting between mild Atlantic weather in the west and drier continental weather in the east — four distinct seasons, long grey winters, and warm rather than hot summers.",
          stability:
            "Predictable and moderate: damaging extremes are rare. But summers are trending hotter and drier, and heatwaves now arrive most years.",
          seasons: [
            {
              label: "Winter",
              months: "Dec–Feb",
              temp: "−2 to 4°C",
              precip: "Grey & wet; snow in the south and east",
              note: "Short daylight",
            },
            {
              label: "Spring",
              months: "Mar–May",
              temp: "4 to 18°C",
              precip: "Mild, showery",
            },
            {
              label: "Summer",
              months: "Jun–Aug",
              temp: "18 to 28°C",
              precip: "Warm, the odd heatwave",
              note: "Long evenings",
            },
            {
              label: "Autumn",
              months: "Sep–Nov",
              temp: "6 to 16°C",
              precip: "Cool, damp, foggy",
            },
          ],
        },
      },
      people: {
        summary:
          "Germany is Europe's most populous country and one of its oldest — a median age in the mid-forties, low birth rates, and a workforce shrinking as the boomer generation retires, which is exactly why it recruits so hard abroad. It has long been a country of immigration: nearly a fifth of residents were born abroad, with large Turkish, Ukrainian, Polish, Arab, and Southern-European communities concentrated in the cities.",
        stats: [
          { label: "Population", value: "84M", tone: "neutral" },
          { label: "Density", value: "232 /km²" },
          { label: "Median age", value: "45", note: "among the world's oldest", tone: "warn" },
          { label: "Life expectancy", value: "81 yrs", tone: "pos" },
          { label: "Urban", value: "78%" },
          { label: "Foreign-born", value: "≈19%", note: "highly international", tone: "pos" },
        ],
        ageBands: [
          { label: "0–14", value: 14 },
          { label: "15–64", value: 64 },
          { label: "65+", value: 22, note: "ageing" },
        ],
        religions: [
          { label: "Unaffiliated", value: 43 },
          { label: "Catholic", value: 26 },
          { label: "Protestant", value: 23 },
          { label: "Muslim", value: 5 },
          { label: "Other", value: 3 },
        ],
      },
      economy: {
        summary:
          "The EU's industrial engine — the fourth-largest economy in the world, built on exports of cars, machinery, and chemicals rather than a single boom sector. Growth has been flat in recent years, but wages are solid, unemployment is low, and an ageing workforce means real, sustained demand for skilled migrants across trades, engineering, health, and IT.",
        stats: [
          { label: "GDP", value: "$4.5T", note: "4th largest", tone: "pos" },
          { label: "GDP per capita", value: "$54,000", tone: "pos" },
          { label: "Unemployment", value: "≈6%", tone: "pos" },
          { label: "Median gross pay", value: "€4,300/mo" },
          { label: "Minimum wage", value: "€12.82/hr", note: "statutory" },
          { label: "Growth", value: "≈0%", note: "stagnant since 2023", tone: "warn" },
        ],
        trends: [
          {
            id: "gdp",
            label: "GDP",
            prefix: "$",
            unit: "T",
            points: [
              { year: "2018", value: 3.97 },
              { year: "2019", value: 3.96 },
              { year: "2020", value: 3.89 },
              { year: "2021", value: 4.28 },
              { year: "2022", value: 4.08 },
              { year: "2023", value: 4.46 },
              { year: "2024", value: 4.53 },
            ],
            note: "Nominal output has kept climbing, but real growth has been flat since 2022 — an energy shock, weak exports, and soft industrial demand have left the economy stagnant rather than shrinking.",
          },
          {
            id: "pay",
            label: "Median pay",
            prefix: "€",
            unit: "/mo",
            points: [
              { year: "2018", value: 3450 },
              { year: "2019", value: 3550 },
              { year: "2020", value: 3600 },
              { year: "2021", value: 3750 },
              { year: "2022", value: 3900 },
              { year: "2023", value: 4100 },
              { year: "2024", value: 4300 },
            ],
            note: "Gross wages have risen steadily and jumped after 2022 as unions won inflation catch-up deals — though real (after-inflation) pay only recovered its 2021 level in 2024.",
          },
          {
            id: "unemployment",
            label: "Unemployment",
            unit: "%",
            points: [
              { year: "2018", value: 5.2 },
              { year: "2019", value: 5.0 },
              { year: "2020", value: 6.0 },
              { year: "2021", value: 5.7 },
              { year: "2022", value: 5.3 },
              { year: "2023", value: 5.7 },
              { year: "2024", value: 6.0 },
            ],
            note: "Low and stable by international standards. It rose modestly through the 2020s slowdown but never spiked — the deeper story is a labour shortage, not a jobs shortage.",
          },
          {
            id: "inflation",
            label: "Inflation",
            unit: "%",
            points: [
              { year: "2018", value: 1.9 },
              { year: "2019", value: 1.4 },
              { year: "2020", value: 0.5 },
              { year: "2021", value: 3.1 },
              { year: "2022", value: 6.9 },
              { year: "2023", value: 5.9 },
              { year: "2024", value: 2.3 },
            ],
            note: "The 2022 energy crisis drove inflation to a post-reunification high near 7%, squeezing real incomes; it has since fallen back close to the ECB's 2% target.",
          },
        ],
      },
      government: {
        summary:
          "A stable federal parliamentary democracy with strong institutions, an independent judiciary, and a free press. Power is shared between the federal government and sixteen states, and coalition government is the norm. A resurgent far right is the sharpest tension in current politics, strongest in the east.",
        system: "Federal parliamentary republic",
        memberships: ["EU", "Eurozone", "Schengen", "NATO", "UN", "OECD", "G7"],
        stats: [
          { label: "Democracy Index", value: "8.8 / 10", note: "full democracy", tone: "pos" },
          { label: "Corruption (CPI)", value: "Top 15", note: "low corruption", tone: "pos" },
          { label: "Press freedom", value: "High", tone: "pos" },
          { label: "Rule of law", value: "Strong", tone: "pos" },
        ],
        parties: [
          { label: "CDU/CSU", value: 28, note: "centre-right · governing" },
          { label: "AfD", value: 21, note: "far-right · opposition" },
          { label: "SPD", value: 16, note: "centre-left · governing" },
          { label: "Greens", value: 12, note: "opposition" },
          { label: "Die Linke", value: 9, note: "left · opposition" },
          { label: "Others", value: 14 },
        ],
        currentGovernment:
          "A CDU/CSU–SPD 'grand coalition' has governed since May 2025 under Chancellor Friedrich Merz, formed after the centre-right won February 2025's snap election — called when the previous three-party 'traffic-light' coalition collapsed over the budget.",
        nextElection: "Next federal election due by 2029",
        timeline: [
          { period: "2025–", label: "Merz cabinet", note: "CDU/CSU–SPD grand coalition" },
          { period: "2021–2025", label: "Scholz cabinet", note: "SPD–Greens–FDP 'traffic light'" },
          { period: "2005–2021", label: "Merkel era", note: "CDU-led, four terms" },
          { period: "1998–2005", label: "Schröder cabinet", note: "SPD–Greens" },
        ],
      },
      culture: {
        summary:
          "Order, planning, and privacy run deep. People value directness, punctuality, and a firm line between work and private life — long holidays are taken seriously and out-of-hours emails are not. Newcomers meet a warm, reliable society once past an initially reserved and rule-bound surface.",
        notes: [
          {
            title: "Punctuality is respect",
            body: "Being on time is expected socially and professionally; five minutes late warrants a message.",
          },
          {
            title: "Sundays are quiet",
            body: "Most shops close and 'Ruhezeit' quiet hours limit noise — no drilling or loud laundry. Stock up on Saturday.",
          },
          {
            title: "Cash still matters",
            body: "Cards are increasingly accepted, but many bakeries, bars, and small shops remain cash-only. Carry some.",
          },
          {
            title: "Recycling is a system",
            body: "Waste is sorted into several bins, and bottles carry a 'Pfand' deposit you reclaim at the machine.",
          },
          {
            title: "Directness isn't rudeness",
            body: "People say what they mean plainly. It reads as blunt at first but is meant as honesty, not hostility.",
          },
          {
            title: "Register everything",
            body: "Life runs on paperwork — the 'Anmeldung' address registration unlocks bank accounts, tax IDs, and contracts.",
          },
        ],
      },
      safety: {
        summary:
          "One of the safer large countries in the world. Violent crime is low and policing is trusted; the everyday risks are pickpocketing around transit hubs and tourist areas rather than personal danger.",
        stats: [
          { label: "Overall safety", value: "High", tone: "pos" },
          { label: "Violent crime", value: "Low", tone: "pos" },
          { label: "Petty theft", value: "Moderate", note: "transit hubs", tone: "warn" },
          { label: "Emergency", value: "112", note: "police & ambulance" },
        ],
        trend: {
          direction: "stable",
          note: "Recorded crime ticked up in 2023 from pandemic-era lows — mostly theft and public-space offences rather than violence — but it stays far below the 1990s peak and the long-term trend is flat-to-down.",
        },
        regional: {
          summary:
            "Safety is high nationwide, and risk is about specific districts, not whole regions. The everyday concern is petty theft in a handful of big-city areas, not personal danger.",
          areas: [
            {
              label: "Big-city station districts",
              note: "Frankfurt's Bahnhofsviertel, parts of central Berlin and similar hubs see the most open drug activity and pickpocketing.",
              tone: "warn",
            },
            {
              label: "Tourist & nightlife zones",
              note: "Crowds mean pickpockets — Oktoberfest, Christmas markets, and the main shopping streets.",
              tone: "warn",
            },
            {
              label: "Smaller cities & rural areas",
              note: "Very low crime; the real risks out here are road safety and isolation, not people.",
              tone: "pos",
            },
            {
              label: "Late-night transit",
              note: "Generally safe and well-used; concerns cluster around a few nightlife hubs rather than the network as a whole.",
              tone: "neutral",
            },
          ],
        },
      },
      rights: {
        lgbtq:
          "Legally strong and socially accepting, especially in cities. Same-sex marriage has been legal since 2017, discrimination is banned, and a 2024 self-determination law lets people change their legal gender by declaration.",
        minorities:
          "A long-established country of immigration with anti-discrimination law and large Turkish, Ukrainian, Arab, and Eastern European communities. Day-to-day acceptance is high in urban areas, though far-right sentiment is a real and rising tension in parts of the east.",
      },
    },
    living: {
      currency: "EUR €",
      intro:
        "What day-to-day life actually costs in Germany — rent by city, a realistic monthly budget, everyday prices, tax, healthcare, and schooling. Figures are typical 2025 ranges in euros; the big cities (Munich above all) run well over the national average, the east and smaller cities well under.",
      budgets: [
        {
          label: "Single",
          total: "€2,400",
          note: "one person, mid-range 1-bed",
          lines: [
            { label: "Rent", value: 1050 },
            { label: "Groceries", value: 300 },
            { label: "Eating out & fun", value: 350 },
            { label: "Utilities & internet", value: 260 },
            { label: "Health insurance", value: 250 },
            { label: "Transport", value: 60 },
            { label: "Other", value: 130 },
          ],
        },
        {
          label: "Couple",
          total: "€3,600",
          note: "two earners sharing a flat",
          lines: [
            { label: "Rent", value: 1300 },
            { label: "Groceries", value: 560 },
            { label: "Eating out & fun", value: 560 },
            { label: "Utilities & internet", value: 300 },
            { label: "Health insurance", value: 500 },
            { label: "Transport", value: 120 },
            { label: "Other", value: 260 },
          ],
        },
        {
          label: "Family of four",
          total: "€5,300",
          note: "two adults, two kids, incl. childcare",
          lines: [
            { label: "Rent", value: 1900 },
            { label: "Groceries", value: 950 },
            { label: "Eating out & fun", value: 600 },
            { label: "Utilities & internet", value: 380 },
            { label: "Health insurance", value: 620 },
            { label: "Transport", value: 200 },
            { label: "Other", value: 650 },
          ],
        },
      ],
      rent: {
        note: "Monthly rent for an unfurnished flat. City centres command a large premium, and Munich is in a league of its own; the east (Leipzig, Dresden) is far cheaper.",
        rows: [
          { city: "Munich", centre: 1500, outer: 1150, family: 2800, note: "priciest" },
          { city: "Berlin", centre: 1250, outer: 950, family: 2300 },
          { city: "Hamburg", centre: 1150, outer: 880, family: 2100 },
          { city: "Cologne", centre: 1050, outer: 820, family: 1950 },
          { city: "Leipzig", centre: 780, outer: 620, family: 1450, note: "cheapest major city" },
        ],
      },
      groceries: [
        { label: "Milk (1 L)", value: "€1.10" },
        { label: "Bread (loaf)", value: "€1.80" },
        { label: "Eggs (12)", value: "€2.60" },
        { label: "Chicken breast (1 kg)", value: "€9.00" },
        { label: "Apples (1 kg)", value: "€2.70" },
        { label: "Weekly shop", value: "€55–70", note: "one person" },
      ],
      eatingOut: [
        { label: "Cappuccino", value: "€3.30" },
        { label: "Beer (0.5 L, bar)", value: "€4.50" },
        { label: "Lunch (Imbiss / menu)", value: "€12" },
        { label: "Dinner for two", value: "€60", note: "mid-range" },
        { label: "Fast-food combo", value: "€10" },
      ],
      essentials: [
        {
          label: "Transport pass",
          value: "€58/mo",
          note: "Deutschlandticket, nationwide",
          tone: "pos",
        },
        { label: "Utilities (85 m²)", value: "€280/mo", note: "heat, power, water" },
        { label: "Internet (fibre)", value: "€35/mo" },
        { label: "Mobile plan", value: "€15–30/mo" },
      ],
      healthcare: {
        summary:
          "Healthcare is universal, mostly through public 'statutory' insurance (GKV) that about 90% of residents use. Contributions are a percentage of your pay, split with your employer, and cover your spouse and children at no extra cost. Care is high quality and access is broad, though non-urgent specialist appointments can mean a wait. Temporary-protection status includes coverage.",
        stats: [
          { label: "System", value: "Public (GKV)", tone: "pos" },
          { label: "Your share", value: "~7.3% of pay", note: "employer matches" },
          { label: "Covers", value: "You + family", tone: "pos" },
          { label: "GP wait", value: "Days" },
          { label: "Specialist wait", value: "Weeks", tone: "warn" },
          { label: "Emergency", value: "112" },
        ],
        ways: [
          {
            label: "Public statutory (GKV)",
            tagline: "The default — about 90% of residents.",
            cost: "~7.3% of pay (employer matches)",
            quality:
              "High standard and broad access. Contributions scale with income, and your spouse and children are covered at no extra cost. You pick a fund (TK, AOK, Barmer, …); they're broadly similar.",
            caveats: [
              "Non-urgent specialist appointments can mean a wait of weeks.",
              "Some extras (private rooms, certain dental) aren't fully covered.",
            ],
            tone: "pos",
          },
          {
            label: "Private (PKV)",
            tagline: "For higher earners, the self-employed, and officials.",
            cost: "Risk-based premium, from ~€300/mo",
            quality:
              "Faster specialist access, more choice of doctor, and better hospital comfort. Premiums are based on age and health at entry, not income, so it's cheapest for the young and healthy.",
            caveats: [
              "Premiums rise with age and can become expensive in retirement.",
              "Switching back to public insurance later is hard.",
              "Each family member pays their own premium — no free family cover.",
            ],
            tone: "warn",
          },
          {
            label: "Covered by status",
            tagline: "Students, job-seekers, and protection holders.",
            cost: "Subsidised or state-paid",
            quality:
              "Students get low-cost public student insurance; people under temporary protection are enrolled in public cover. Everyone in Germany must hold insurance — being uninsured isn't an option.",
            caveats: [
              "Proof of cover is required for your visa or residence permit.",
              "Gaps in coverage can create back-payment demands later.",
            ],
            tone: "neutral",
          },
        ],
      },
      schooling: {
        summary:
          "State schools are free and generally good, and schooling is compulsory from age six. Teaching is in German, so younger children adapt fastest while teenagers often start in 'Willkommensklassen' welcome classes. Public childcare (Kita) is heavily subsidised but places are scarce and waitlisted; international schools exist in the big cities at private-school prices.",
        stats: [
          { label: "State school", value: "Free", tone: "pos" },
          { label: "Language", value: "German" },
          { label: "Childcare (Kita)", value: "€0–300/mo", note: "income-based" },
          { label: "International school", value: "€10k–25k/yr", tone: "warn" },
          { label: "Compulsory", value: "Age 6–18" },
          { label: "University", value: "Free (public)", tone: "pos" },
        ],
        options: [
          {
            label: "State schools",
            tagline: "Free, compulsory, German-language.",
            cost: "Free",
            quality:
              "Generally good and the norm — most children attend. Younger kids adapt fastest; newcomers often start in 'Willkommensklassen' welcome classes to build German before joining mainstream lessons.",
            caveats: [
              "Teaching is in German, so teenagers face the steepest adjustment.",
              "Quality and the academic-track (Gymnasium) split vary by state and neighbourhood.",
            ],
            tone: "pos",
          },
          {
            label: "Private & international",
            tagline: "Fee-paying, often English or bilingual.",
            cost: "€10k–25k/yr",
            quality:
              "International schools offer English-language or IB curricula and a softer landing for a family that may move again. Concentrated in the big cities (Berlin, Munich, Frankfurt, Hamburg).",
            caveats: [
              "Expensive, and the best have waiting lists.",
              "Limited choice outside major cities.",
            ],
            tone: "warn",
          },
          {
            label: "Childcare (Kita)",
            tagline: "Nursery & preschool, ages ~1–6.",
            cost: "€0–300/mo, income-based",
            quality:
              "Heavily subsidised and good, with a legal right to a place from age one — but demand outstrips supply in cities, so effective access depends on securing a slot.",
            caveats: [
              "Places are scarce and waitlisted; apply early and widely.",
              "Opening hours may not cover full-time work.",
            ],
            tone: "neutral",
          },
        ],
      },
      leisure: [
        { label: "Gym membership", value: "€25–40/mo" },
        { label: "Cinema ticket", value: "€12" },
        { label: "Streaming (std)", value: "€13/mo" },
        { label: "Haircut", value: "€25" },
        { label: "Museum entry", value: "€10" },
        { label: "Public pool", value: "€5" },
      ],
    },
    work: {
      intro:
        "How you actually earn a living in Germany — the ways to work, how each is taxed, getting registered, finding a job, and getting your qualifications recognised. It is a deep, formal labour market with strong protections and a serious skills shortage, but it runs on paperwork and, often, on German.",
      rightToWork: {
        summary:
          "Whether you can work depends on your status, not your job. EU citizens work freely. Ukrainians under temporary protection have the immediate right to take any employment or go self-employed. Most work visas (Blue Card, Skilled Worker) tie the permit to qualifying employment, while asylum seekers face a waiting period. Once you hold a settlement permit, the restrictions fall away.",
        stats: [
          {
            label: "Temporary protection",
            value: "Work allowed",
            note: "immediate, any job",
            tone: "pos",
          },
          { label: "EU Blue Card", value: "Tied to job", note: "above salary threshold" },
          { label: "Job-seeker visa", value: "6 months", note: "to find a role" },
          { label: "Minimum wage", value: "€12.82/hr", tone: "pos" },
        ],
      },
      modes: [
        {
          label: "Employee (Angestellt)",
          tagline: "The default — a contract, payroll, and full social cover.",
          taxNote: "Income tax and social contributions are withheld at source; most never file.",
          setupNote: "Just a contract and a tax ID — your employer handles the registration.",
          pros: [
            "Strong protections & notice",
            "Health, pension, unemployment included",
            "No bookkeeping",
          ],
          cons: ["Less flexibility", "Higher effective tax than some setups"],
        },
        {
          label: "Freelancer (Freiberufler)",
          tagline: "Independent professionals — devs, doctors, designers, writers.",
          taxNote: "Income tax + VAT, with quarterly prepayments; no trade tax.",
          setupNote: "Register with the Finanzamt for a tax number — no trade licence needed.",
          pros: ["Low setup, no trade tax", "Keep your own clients", "Deduct expenses"],
          cons: ["You arrange your own insurance", "Bookkeeping + VAT filings", "Lumpy income"],
        },
        {
          label: "Trade / sole trader (Gewerbe)",
          tagline: "Commercial self-employment — shops, trades, e-commerce.",
          taxNote: "Income tax + VAT + trade tax (Gewerbesteuer) above an allowance.",
          setupNote: "Register a Gewerbe at the local trade office, then the Finanzamt.",
          pros: ["Straightforward to start", "Full control"],
          cons: ["Trade tax", "Chamber of commerce fees", "More admin"],
        },
        {
          label: "Company owner (GmbH / UG)",
          tagline: "A limited company — for scale, a liability shield, or hiring.",
          taxNote:
            "Corporate + trade tax on profit (~30%), then tax on the salary/dividends you draw.",
          setupNote: "Notarised formation; €25k capital for a GmbH (€1 for a UG).",
          pros: ["Limited liability", "Credible for clients & investors", "Can employ others"],
          cons: ["Formation cost & notary", "Double-entry accounts", "Needs a tax adviser"],
        },
        {
          label: "Remote for a foreign employer",
          tagline: "Keep an overseas job while living here.",
          taxNote:
            "Usually taxable in Germany once resident; often run through an Employer of Record.",
          setupNote: "Check tax-residency and social-security rules before you move.",
          pros: ["Keep your salary & role", "No local job hunt"],
          cons: ["Tax & social-security complexity", "Employer must be willing", "Grey areas"],
        },
      ],
      incomeTax: {
        summary:
          "Germany taxes worldwide income progressively, from 0% up to 45%, plus social insurance. How much you keep depends on how you are set up: employees have everything withheld, while the self-employed pay quarterly and fund their own insurance and VAT.",
        takeHome: {
          grossLabel: "On €4,000/mo gross · employee, single, no church tax",
          gross: 4000,
          net: 2594,
          deductions: [
            { label: "Income tax", value: "€560" },
            { label: "Pension", value: "€372" },
            { label: "Health insurance", value: "€330" },
            { label: "Long-term care", value: "€92" },
            { label: "Unemployment", value: "€52" },
          ],
          note: "Roughly 35–40% of a mid-range salary goes to tax and social insurance — but that funds your healthcare, pension, and unemployment cover, and your employer pays a matching share on top.",
        },
        lanes: [
          { mode: "Employee", burden: "≈35–40%", note: "tax + social, withheld at source" },
          {
            mode: "Freelancer",
            burden: "≈25–42%",
            note: "income tax; you fund your own insurance",
          },
          {
            mode: "GmbH owner",
            burden: "≈30% + draw",
            note: "corporate + trade, then tax on pay/dividends",
          },
        ],
        trends: [
          {
            id: "single",
            label: "Single earner",
            unit: "%",
            points: [
              { year: "2018", value: 49.5 },
              { year: "2019", value: 49.4 },
              { year: "2020", value: 49.0 },
              { year: "2021", value: 48.1 },
              { year: "2022", value: 47.8 },
              { year: "2023", value: 47.9 },
              { year: "2024", value: 47.9 },
            ],
            note: "The tax wedge on a single average earner — total income tax and social contributions as a share of labour cost — is among the OECD's highest, near 48%. It has drifted down slightly as tax thresholds were adjusted for inflation.",
          },
          {
            id: "family",
            label: "One-earner family",
            unit: "%",
            points: [
              { year: "2018", value: 34.3 },
              { year: "2019", value: 34.0 },
              { year: "2020", value: 32.7 },
              { year: "2021", value: 32.7 },
              { year: "2022", value: 32.9 },
              { year: "2023", value: 33.0 },
              { year: "2024", value: 33.1 },
            ],
            note: "A one-earner couple with two children pays far less — around a third — thanks to joint filing (Ehegattensplitting) and child allowances. The gap between single and family taxation is one of the widest in Europe.",
          },
        ],
        accounting:
          "Employees rarely file. The self-employed must keep books, charge and remit VAT (unless small-business exempt), and file quarterly prepayments plus an annual return — most hire a Steuerberater (tax adviser) for €1,000–3,000 a year. Online filing goes through the ELSTER portal.",
      },
      finding: {
        summary:
          "The market rewards German and recognised qualifications, but English-only roles are common in tech, startups, and international firms. Applications are formal — a tailored CV, often a cover letter, and certificates matter.",
        channels: [
          "StepStone",
          "Indeed",
          "LinkedIn / Xing",
          "Make-it-in-Germany",
          "Bundesagentur für Arbeit",
          "Company career pages",
          "Recruiters (IT & engineering)",
        ],
      },
      industries: [
        "Automotive",
        "Machinery & engineering",
        "Chemicals & pharma",
        "Electrical & electronics",
        "IT & software",
        "Healthcare & care work",
        "Skilled trades",
        "Logistics",
      ],
      setup: {
        summary:
          "Whatever you do, the first moves are the same — register where you live and get into the tax system. From there the path forks: an employer handles most of it for an employee, while the self-employed take on registration, insurance, and bookkeeping themselves.",
        general: [
          {
            title: "Register your address (Anmeldung)",
            body: "Within two weeks of moving in, register at the Bürgeramt. Everything downstream — tax ID, bank account, contracts — depends on it.",
          },
          {
            title: "Get your tax ID and a bank account",
            body: "A tax identification number (Steuer-ID) is posted to your registered address; open a German bank account to receive pay and set up direct debits.",
          },
          {
            title: "Sort health insurance",
            body: "Cover is mandatory for everyone. Employees are enrolled in a public fund automatically; the self-employed choose public (GKV) or private (PKV) themselves.",
          },
        ],
        byMode: [
          {
            mode: "Employee",
            note: "Your employer does most of the paperwork.",
            steps: [
              {
                title: "Hand over your details",
                body: "Give your employer your tax ID, bank details, and social-security number; they register you for tax and social insurance.",
              },
              {
                title: "Check your first payslip",
                body: "Tax class, church tax, and deductions are withheld at source — verify your tax class is right, as it sets your take-home.",
              },
            ],
          },
          {
            mode: "Freelancer (Freiberufler)",
            note: "You register yourself, but skip the trade office.",
            steps: [
              {
                title: "Register with the Finanzamt",
                body: "Complete the Fragebogen zur steuerlichen Erfassung to get a tax number; no trade licence is needed for genuine liberal professions.",
              },
              {
                title: "Arrange your own insurance",
                body: "You fund your own health cover and, if you want it, pension and liability insurance.",
              },
              {
                title: "Set up invoicing and VAT",
                body: "Choose accounting software or a Steuerberater, and decide on small-business VAT exemption before your first invoice.",
              },
            ],
          },
          {
            mode: "Sole trader / business (Gewerbe)",
            note: "One extra step: the trade office.",
            steps: [
              {
                title: "Register a Gewerbe",
                body: "Register the trade at the Gewerbeamt first; they notify the Finanzamt, which sends the tax questionnaire.",
              },
              {
                title: "Join the chamber (IHK/HWK)",
                body: "Commercial activities carry mandatory chamber-of-commerce membership and a small annual fee.",
              },
              {
                title: "Handle trade tax and books",
                body: "Budget for Gewerbesteuer above the allowance and keep proper books — most owners use a Steuerberater.",
              },
            ],
          },
        ],
      },
      credentials: {
        summary:
          "Regulated professions — doctors, nurses, teachers, lawyers, many trades — require formal recognition (Anerkennung) of your foreign qualification before you can practise. Non-regulated fields don't strictly need it, but recognition (or an ANABIN assessment) strengthens applications and pay. Ukrainians have streamlined recognition support.",
        stats: [
          { label: "Regulated jobs", value: "Recognition required", tone: "warn" },
          { label: "Portal", value: "anerkennung-in-deutschland.de" },
          { label: "Degree check", value: "ANABIN database" },
          { label: "Typical time", value: "3–6 months", tone: "warn" },
        ],
      },
      demand: {
        summary:
          "An ageing workforce and a deep industrial base drive chronic shortages in a handful of fields — these are where hiring is fastest, visa routes are smoothest, and you have the most bargaining power. The most-wanted roles below carry official 'shortage occupation' advantages; the more competitive ones usually need fluent German and face a crowded market.",
        inDemand: [
          {
            label: "Nurses & care workers",
            why: "A rapidly ageing population and a structural care shortage; recognition support is streamlined.",
            pay: "€3,000–4,200/mo",
          },
          {
            label: "Doctors",
            why: "Persistent gaps in hospitals and rural practices; a recognised licence (Approbation) is the gate.",
            pay: "€5,500–9,000/mo",
          },
          {
            label: "Software & IT",
            why: "Broad demand across industry and startups, with the most English-friendly roles.",
            pay: "€4,500–7,500/mo",
          },
          {
            label: "Engineers",
            why: "Mechanical, electrical, and civil engineers underpin the export economy.",
            pay: "€4,500–7,000/mo",
          },
          {
            label: "Skilled trades",
            why: "Electricians, plumbers, welders, and construction trades are short everywhere.",
            pay: "€2,800–4,500/mo",
          },
          {
            label: "Truck & bus drivers",
            why: "Logistics and public transport face an acute driver shortage.",
            pay: "€2,600–3,600/mo",
          },
        ],
        saturated: ["Generalist admin", "Media & journalism", "Junior marketing", "Pure academia"],
        note: "Creative and generalist office roles are far more competitive and almost always need fluent German. If your field is here, expect a longer search and lean on networking over cold applications.",
      },
    },
    family: {
      intro:
        "Who you can bring with you, and on what terms — plus how to move a pet. Germany lets residents reunite with their closest family (a spouse and minor children) with work rights that follow the sponsor, but bringing parents or adult children is reserved for genuine hardship. Cats, dogs, and ferrets travel on a microchip, a rabies shot, and the right paperwork, with no quarantine for compliant animals.",
      reunification: {
        summary:
          "Family reunification (Familiennachzug) is a legal right for your core family once you hold a residence permit — usually a spouse and unmarried children under 18, whose permits and work rights are tied to yours. You generally need to show you can house and support them without state help, and a spouse often needs basic German (A1) before arrival, though Blue Card holders, EU citizens, and Ukrainians under temporary protection are exempt from the language test.",
        stats: [
          { label: "Core family", value: "Spouse + minor kids", tone: "pos" },
          { label: "Their work rights", value: "Follow the sponsor", tone: "pos" },
          { label: "Spouse German", value: "A1", note: "waived in many cases" },
          { label: "Income proof", value: "Required", note: "support without benefits" },
          { label: "Adequate housing", value: "Required" },
          { label: "Processing", value: "3–12 months", tone: "warn" },
        ],
      },
      members: [
        {
          label: "Spouse or registered partner",
          feasibility: "yes",
          tagline: "A husband, wife, or registered life partner.",
          conditions: [
            "Marriage or partnership recognised in Germany",
            "Both partners usually 18 or older",
            "Basic German (A1) before arrival — waived for Blue Card, EU, and protection cases",
          ],
        },
        {
          label: "Children under 18",
          feasibility: "yes",
          tagline: "Your unmarried minor children.",
          conditions: [
            "Under 18 and unmarried",
            "Custody or the other parent's consent",
            "Travel on their own passport",
          ],
        },
        {
          label: "Unmarried or same-sex partner",
          feasibility: "maybe",
          tagline: "A partner you're not married to (yet).",
          conditions: [
            "Much harder without marriage or a registered partnership",
            "Same-sex couples: marry or register a partnership to qualify",
            "Assessed case by case",
          ],
        },
        {
          label: "Parents or adult children",
          feasibility: "no",
          tagline: "Your own or your spouse's parents; grown-up kids.",
          conditions: [
            "No general right for adults",
            "Only in exceptional hardship (extraordinary dependency)",
            "An accompanying minor's sole parent is a narrow exception",
          ],
        },
      ],
      perks: {
        summary:
          "Reuniting family are not just along for the ride — a spouse gets the unrestricted right to work, children slot straight into free schooling, and the whole household is covered by your public health insurance at no extra cost. Families also draw child benefit and some of the most generous parental leave in Europe.",
        stats: [
          { label: "Spouse work", value: "Unrestricted", tone: "pos" },
          { label: "Kids' schooling", value: "Free & compulsory", tone: "pos" },
          { label: "Health cover", value: "Family included", note: "public GKV", tone: "pos" },
          { label: "Child benefit", value: "€255/child/mo", note: "Kindergeld", tone: "pos" },
          { label: "Parental leave", value: "Up to 3 yrs", tone: "pos" },
          { label: "First residence", value: "Tied to sponsor" },
        ],
      },
      pets: {
        summary:
          "Bringing a cat, dog, or ferret from within the EU is simple: an ISO microchip, a valid rabies vaccination, and an EU pet passport. From outside the EU you swap the passport for an official vet health certificate and, from some countries, add a rabies antibody blood test. Compliant animals face no quarantine — but four dog breeds are banned from import, and other breed rules vary by federal state.",
        checklist: [
          {
            title: "Microchip first",
            body: "Your pet needs an ISO-standard (11784/11785) microchip, fitted before the rabies shot so the vaccination is linked to the animal.",
          },
          {
            title: "Rabies vaccination",
            body: "A valid rabies vaccination given at least 21 days before travel — the microchip must already be in place when it's administered.",
          },
          {
            title: "Passport or health certificate",
            body: "EU pets travel on an EU pet passport from any vet; from outside the EU you need an official veterinary health certificate, plus a rabies antibody titre test from higher-risk countries.",
          },
          {
            title: "Register and pay dog tax",
            body: "No quarantine for compliant animals. Once you settle, register a dog with your city and pay the annual Hundesteuer dog tax.",
          },
        ],
        stats: [
          { label: "Quarantine", value: "None", note: "if compliant", tone: "pos" },
          { label: "Microchip", value: "Required", note: "ISO 11784/11785" },
          { label: "Rabies vaccine", value: "21+ days before" },
          { label: "Pets per person", value: "Up to 5" },
          { label: "EU pet passport", value: "From any EU vet", tone: "pos" },
          { label: "Dog tax", value: "€90–190/yr", note: "varies by city", tone: "warn" },
        ],
        restricted: [
          "Pit Bull Terrier",
          "American Staffordshire Terrier",
          "Staffordshire Bull Terrier",
          "Bull Terrier",
        ],
        note: "These four 'category 1' breeds are banned from import into Germany, and rules for other breeds (and any crossbreeds) differ by federal state — check the Bundesland you're moving to before you travel. Exotic, wild, and endangered species carry separate CITES and animal-welfare rules.",
      },
    },
  },
  PT: {
    code: "PT",
    name: "Portugal",
    flag: "\u{1F1F5}\u{1F1F9}",
    region: "Southern Europe",
    tagline: "Southern Europe · mild climate · EU member",
    description:
      "Portugal sits on the Atlantic edge of the Iberian Peninsula: small, temperate, and increasingly popular with newcomers for its mild climate, lower cost of living, and relatively open residence routes. Wages are below the EU average, but so are everyday costs outside Lisbon and Porto. English is common in cities and tourism, and the path to permanent residence and citizenship is shorter than in much of Europe.",
    quickFacts: [
      { label: "Capital", value: "Lisbon" },
      { label: "Language", value: "Portuguese" },
      { label: "Currency", value: "EUR €" },
      { label: "Population", value: "10M" },
      { label: "EU member", value: "Yes" },
    ],
  },
  ES: {
    code: "ES",
    name: "Spain",
    flag: "\u{1F1EA}\u{1F1F8}",
    region: "Southern Europe",
    tagline: "Southern Europe · large economy · EU member",
    description:
      "Spain pairs a large, diverse economy with a warm climate and a strong quality-of-life reputation. Regions vary widely — Madrid and Barcelona are dense and international, while the coast and interior are cheaper and slower-paced. Spanish is essential outside tourist hubs (and Catalan, Basque or Galician in some regions). Residence routes are broad, and after ten years most residents can naturalise.",
    quickFacts: [
      { label: "Capital", value: "Madrid" },
      { label: "Language", value: "Spanish" },
      { label: "Currency", value: "EUR €" },
      { label: "Population", value: "48M" },
      { label: "EU member", value: "Yes" },
    ],
  },
};

/** Per-pairing content: the citizenship-specific read of a destination. */
type PairContent = {
  entry: EntryBrief;
  /** Full Entry view; only UKR/DE is authored so far. */
  entryDetail?: EntryProfile;
  glance: GlanceMetric[];
  fitsYouIf: FitSignal[];
  /** The main language read from this citizen's point of view. */
  language: LanguageForReader;
};

const PAIR_CONTENT: Record<string, PairContent> = {
  "UKR/DE": {
    language: {
      official: ["German"],
      difficulty: {
        label: "Moderately hard",
        rating: { score: 2, max: 5, tone: "warn" },
        note: "German is Germanic and unrelated to Ukrainian or Russian, so grammar and vocabulary start unfamiliar. But it uses the Latin alphabet, and it shares a common Germanic root with English — so if you know some English, words like Haus, Buch, and Wasser are already familiar.",
      },
      english:
        "English gets you far in Berlin, big cities, universities, and tech, but German runs everyday bureaucracy, healthcare, and most jobs. Plan to reach B1 for permanent residence and citizenship.",
    },
    entry: {
      summary:
        "You cross the border visa-free for 90 days — no visa, no pre-registration. From there, seven long-term routes lead onward: temporary protection is the fastest for most Ukrainians, granting the immediate right to live and work, but a job offer, study, or family route may suit you better.",
      facts: [
        { label: "Visa-free", value: "90 days" },
        { label: "Long-term routes", value: "7" },
        { label: "Fastest", value: "Temporary protection" },
      ],
    },
    entryDetail: {
      intro:
        "How you first arrive in Germany as a Ukrainian — the visa-free terms, what to carry across the border, and the temporary-protection status that turns a 90-day visit into the immediate right to stay, work, and study. Arrival is the one thing you sort before anything else, so the order of the first steps matters.",
      arrival: {
        summary:
          "With a biometric Ukrainian passport you enter the Schengen area visa-free for up to 90 days in any 180 — no visa and no pre-registration. You don't have to rely on that clock, though: activating temporary protection replaces it with a renewable residence permit, so most people cross as a visitor and switch to protected status within days.",
        stats: [
          { label: "Visa-free stay", value: "90 / 180 days", tone: "pos" },
          { label: "Visa needed", value: "No", tone: "pos" },
          { label: "Passport", value: "Biometric", note: "or emergency travel doc" },
          { label: "Pre-registration", value: "None", tone: "pos" },
          { label: "Internal borders", value: "No checks", note: "Schengen" },
          { label: "Onward ticket", value: "Not enforced", note: "for protection seekers" },
        ],
      },
      documents: {
        summary:
          "Carry originals where you can — German offices run on documents, and replacing them later is slow. Anything for children and any professional or academic certificates are worth bringing even if you won't need them at the border.",
        items: [
          "Biometric passport, or an emergency travel document",
          "Proof of Ukrainian citizenship or residence",
          "Children's passports and birth certificates",
          "Marriage certificate, if reuniting as a couple",
          "Vaccination records (needed for school and Kita)",
          "Diplomas and qualification certificates, for later recognition",
        ],
      },
      protection: {
        summary:
          "Temporary protection is the fast lane, and it's what almost everyone uses. Under the EU directive first activated in 2022 and extended into 2027, Ukrainians receive a residence permit (§24) without going through the asylum process — the immediate right to live, work, and study, public healthcare, benefits, and school places for children. It's issued for a fixed period and renewed as the EU extends the scheme.",
        stats: [
          { label: "Status", value: "Temporary protection", note: "§24 permit", tone: "pos" },
          { label: "Right to work", value: "Immediate", tone: "pos" },
          { label: "Healthcare", value: "Included", tone: "pos" },
          { label: "Benefits", value: "Bürgergeld", note: "if you need it", tone: "pos" },
          { label: "Extended to", value: "Mar 2027", note: "EU-wide, renewable", tone: "pos" },
          { label: "Apply at", value: "Ausländerbehörde" },
        ],
      },
      onArrival: {
        can: [
          "Stay up to 90 days visa-free while you sort your status",
          "Register your address (Anmeldung)",
          "Apply for temporary protection right away",
          "Enrol your children in school",
          "Open a bank account once registered",
        ],
        cannot: [
          "Take a job before your status is registered",
          "Draw long-term benefits before registering",
          "Stay past 90 days without applying for protection or a permit",
        ],
        note: "The order is the whole game: register your address first, then apply for protection — nearly everything downstream (work, benefits, banking, school) depends on both being done.",
      },
      firstSteps: [
        {
          title: "Find somewhere to stay",
          body: "Arrival centres and municipalities can place you; a private address lets you register straight away and skips the shared-accommodation step.",
        },
        {
          title: "Register your address (Anmeldung)",
          body: "At the local Bürgeramt. This single step unlocks everything downstream — your status, a bank account, benefits, and school places.",
        },
        {
          title: "Apply for temporary protection",
          body: "At the Ausländerbehörde (foreigners' office). You're issued a residence permit under §24, with the right to work from day one.",
        },
        {
          title: "Register for benefits and healthcare",
          body: "Sign up at the Jobcenter for Bürgergeld if you need it, and you're assigned public (GKV) health insurance.",
        },
        {
          title: "Enrol children and start German",
          body: "Register kids for school or a Kita place, and sign up for an integration or language course toward the B1 you'll need later.",
        },
      ],
    },
    glance: [
      { label: "Routes available", value: "7 · 5 categories", section: "routes" },
      {
        label: "Quality of life",
        value: "Very good",
        rating: { score: 5, max: 5, tone: "pos" },
        valueTone: "pos",
        section: "country",
      },
      {
        label: "Cost of living",
        value: "~€2,400/mo",
        rating: { score: 3, max: 5, tone: "warn" },
        note: "single, mid-range",
        section: "living",
      },
      {
        label: "Rent",
        value: "~€1,250/mo",
        rating: { score: 3, max: 5, tone: "warn" },
        note: "1-bed, capital, city centre",
        section: "living",
      },
      {
        label: "Net salary",
        value: "~€2,800/mo",
        rating: { score: 4, max: 5, tone: "pos" },
        note: "full-time median",
        section: "living",
      },
      {
        label: "Healthcare",
        value: "Universal",
        rating: { score: 4, max: 5, tone: "pos" },
        valueTone: "pos",
        section: "country",
      },
      {
        label: "Education",
        value: "Strong",
        rating: { score: 4, max: 5, tone: "pos" },
        valueTone: "pos",
        section: "country",
      },
      {
        label: "Safety",
        value: "High",
        rating: { score: 4, max: 5, tone: "pos" },
        valueTone: "pos",
        note: "low violent crime",
        section: "country",
      },
      {
        label: "Ecology",
        value: "Good",
        rating: { score: 4, max: 5, tone: "pos" },
        valueTone: "pos",
        note: "air & environment",
        section: "country",
      },
      {
        label: "Democracy",
        value: "Full",
        rating: { score: 5, max: 5, tone: "pos" },
        valueTone: "pos",
        section: "country",
      },
      {
        label: "Language",
        value: "German",
        rating: { score: 2, max: 5, tone: "warn" },
        note: "unrelated to Ukrainian; shares some vocabulary with English",
        section: "country",
      },
    ],
    fitsYouIf: [
      {
        text: "You're fleeing the war",
        match: "yes",
        detail: "Immediate temporary protection — live and work, no visa process",
      },
      {
        text: "You have a qualifying job offer",
        match: "yes",
        detail: "EU Blue Card above the salary threshold — the fastest path to PR",
      },
      {
        text: "You hold a recognised university degree",
        match: "yes",
        detail: "Opens the Blue Card and Skilled Worker routes",
      },
      {
        text: "You're self-employed with steady clients",
        match: "maybe",
        detail: "Freelance residence is possible but paperwork-heavy and slower",
      },
      {
        text: "A relative already has residence here",
        match: "yes",
        detail: "Family reunification, with work rights following the sponsor",
      },
      {
        text: "You want to study, then switch to work",
        match: "maybe",
        detail: "Student visa converts to work routes after graduation",
      },
    ],
  },
};

function synthesizePair(): PairContent {
  return {
    language: {
      official: [],
      difficulty: {
        label: "Being gathered",
        rating: { score: 0, max: 5, tone: "neutral" },
        note: "The language read for your citizenship is still being gathered.",
      },
      english: "Being gathered.",
    },
    entry: {
      summary: "Entry rules for your citizenship are still being gathered.",
      facts: [],
    },
    glance: [
      { label: "Routes available", value: "—", section: "routes" },
      { label: "Quality of life", value: "—", section: "country" },
      { label: "Cost of living", value: "—", section: "living" },
      { label: "Safety", value: "—", section: "country" },
      { label: "Language", value: "—", note: "being gathered", section: "country" },
    ],
    fitsYouIf: [
      { text: "You have a qualifying job offer", match: "maybe" },
      { text: "You hold a recognised university degree", match: "maybe" },
      { text: "A close relative already has residence here", match: "maybe" },
      { text: "You can show steady self-employed income", match: "maybe" },
    ],
  };
}

/**
 * Resolve the Overview profile for a citizenship × destination, or `null` when
 * either code is outside the demo set. Codes are matched case-insensitively so
 * URLs like `/explore/ukr/de` and `/explore/UKR/DE` both resolve.
 */
export function getDestinationProfile(
  citizenshipCode: string,
  destinationCode: string,
): DestinationProfile | null {
  const citizenship = CITIZENSHIPS[citizenshipCode.toUpperCase()];
  const destinationEntry = DESTINATIONS[destinationCode.toUpperCase()];
  if (!citizenship || !destinationEntry) {
    return null;
  }

  const {
    quickFacts,
    country: countryBase,
    living,
    work,
    family,
    ...destination
  } = destinationEntry;
  const pair = PAIR_CONTENT[`${citizenship.code}/${destination.code}`] ?? synthesizePair();
  const { language, ...overview } = pair;

  // Country facts are destination-level; only the language read is per-citizen,
  // so it is folded in here. Absent country/living/work/family facts leave those
  // views a graceful stub.
  const country = countryBase ? { ...countryBase, language } : undefined;

  return { citizenship, destination, quickFacts, ...overview, country, living, work, family };
}
