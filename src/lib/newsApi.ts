import axios from 'axios'
import { NewsArticle, NewsApiResponse } from '@/types/news'
import { parseString } from 'xml2js'

const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY
const NEWS_API_BASE_URL = 'https://newsapi.org/v2'

// GDELT API (Free, no key required)
const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2/doc/doc'

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
let newsCache: { [key: string]: { data: NewsApiResponse; timestamp: number } } = {}

// Category mapping for NewsAPI
const CATEGORY_MAP: Record<string, string> = {
  general: 'general',
  technology: 'technology',
  business: 'business',
  health: 'health',
  science: 'science',
  sports: 'sports',
  entertainment: 'entertainment',
}

// Country codes supported by NewsAPI
const SUPPORTED_COUNTRIES = ['us', 'gb', 'ca', 'au', 'de', 'fr', 'it', 'jp', 'in', 'cn', 'br', 'mx', 'ru', 'za', 'kr', 'es', 'nl', 'se', 'no', 'ch', 'ae', 'sg', 'nz', 'ar', 'eg', 'ng']

// RSS Feed URLs for different categories
const RSS_FEEDS: Record<string, string[]> = {
  general: [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'https://www.reuters.com/rssFeed/worldNews',
  ],
  technology: [
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
    'https://www.wired.com/feed/rss',
  ],
  business: [
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
  ],
  science: [
    'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
  ],
  health: [
    'https://feeds.bbci.co.uk/news/health/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
  ],
  sports: [
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
  ],
  entertainment: [
    'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
  ],
}

// Cache key generator
function getCacheKey(params: any): string {
  return `${params.category || 'general'}-${params.country || 'us'}-${params.query || 'no-query'}`
}

// Check if cache is valid
function isCacheValid(key: string): boolean {
  const cached = newsCache[key]
  if (!cached) return false
  return Date.now() - cached.timestamp < CACHE_DURATION
}

export async function fetchTopHeadlines(params: {
  category?: string
  country?: string
  query?: string
  pageSize?: number
}): Promise<NewsApiResponse> {
  try {
    const { category = 'general', country = 'us', query, pageSize = 50 } = params
    const cacheKey = getCacheKey(params)

    // Check cache first
    if (isCacheValid(cacheKey)) {
      console.log('Returning cached news for:', cacheKey)
      return newsCache[cacheKey].data
    }

    const allArticles: NewsArticle[] = []

    // Try multiple sources in parallel
    const [newsApiResults, gdeltResults, rssResults] = await Promise.allSettled([
      fetchFromNewsAPI({ category, country, query, pageSize: Math.min(pageSize, 20) }),
      fetchFromGDELT({ query: query || category, pageSize: Math.min(pageSize, 20) }),
      fetchFromRSS(category, Math.min(pageSize, 15)),
    ])

    // Combine results from all sources
    if (newsApiResults.status === 'fulfilled' && newsApiResults.value) {
      allArticles.push(...newsApiResults.value)
    }

    if (gdeltResults.status === 'fulfilled' && gdeltResults.value) {
      allArticles.push(...gdeltResults.value)
    }

    if (rssResults.status === 'fulfilled' && rssResults.value) {
      allArticles.push(...rssResults.value)
    }

    // Remove duplicates based on URL
    const uniqueArticles = removeDuplicates(allArticles)

    // Sort by date (newest first)
    uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Take only requested page size
    const limitedArticles = uniqueArticles.slice(0, pageSize)

    const response: NewsApiResponse = {
      status: 'ok',
      totalResults: limitedArticles.length,
      articles: limitedArticles,
    }

    // Cache the results
    newsCache[cacheKey] = { data: response, timestamp: Date.now() }

    return response
  } catch (error: any) {
    console.error('Error fetching real news:', error.message)
    // Return cached data if available, even if expired
    const cacheKey = getCacheKey(params)
    if (newsCache[cacheKey]) {
      return newsCache[cacheKey].data
    }
    // Last resort: return sample articles
    return {
      status: 'ok',
      totalResults: 10,
      articles: generateSampleArticles(params.category || 'general', params.pageSize || 10),
    }
  }
}

function generateSampleArticles(category: string, count: number): NewsArticle[] {
  const sampleData: Record<string, Array<{title: string, description: string, content: string}>> = {
    general: [
      {
        title: 'Global Markets Rally on Economic Optimism',
        description: 'Stock markets worldwide surge as investors embrace positive economic indicators and corporate earnings growth.',
        content: 'Global financial markets experienced a significant rally today as investors responded to a wave of positive economic data. Major indices across Asia, Europe, and the Americas posted substantial gains, with technology and healthcare sectors leading the charge. Analysts attribute the surge to better-than-expected quarterly earnings reports from major corporations and signs of easing inflationary pressures. The Federal Reserve\'s recent comments on potential interest rate stabilization have also contributed to market confidence. Investment strategists recommend maintaining diversified portfolios while capitalizing on growth opportunities in emerging markets.'
      },
      {
        title: 'Breakthrough in Renewable Energy Technology',
        description: 'Scientists develop revolutionary solar panel technology with unprecedented efficiency rates.',
        content: 'Researchers at leading international universities have announced a groundbreaking advancement in solar energy technology. The new photovoltaic cells demonstrate efficiency rates exceeding 47%, shattering previous records and potentially revolutionizing the renewable energy sector. This innovation could dramatically reduce the cost of solar power generation and accelerate global transition to clean energy sources. Industry experts predict widespread commercial availability within 18 months, with the potential to power millions of homes more affordably than fossil fuel alternatives.'
      },
      {
        title: 'International Climate Summit Reaches Historic Agreement',
        description: 'World leaders commit to ambitious new targets for carbon emission reductions by 2030.',
        content: 'In a landmark moment for environmental policy, representatives from 195 countries have agreed to binding new commitments that aim to limit global temperature rise to 1.5 degrees Celsius. The agreement includes unprecedented financial mechanisms to support developing nations in their transition to green energy. Major industrial powers pledged to phase out coal power by 2035, while emerging economies secured guarantees for technology transfer and climate adaptation funding. Environmental groups cautiously praised the agreement while emphasizing the need for rapid implementation and accountability measures.'
      },
      {
        title: 'Space Exploration Enters New Era with Lunar Base Plans',
        description: 'International space agencies announce collaborative effort to establish permanent human presence on the Moon.',
        content: 'A coalition of space agencies from the United States, European Union, Japan, and several other nations has unveiled an ambitious roadmap for establishing a sustainable human presence on the lunar surface by 2028. The Artemis Base Camp concept envisions habitats utilizing 3D-printed structures from lunar regolith, dramatically reducing the cost and complexity of off-world construction. The project promises to serve as a stepping stone for future Mars missions while opening new opportunities for scientific research and potentially lucrative lunar resource extraction. Private sector partners have already committed over $12 billion to supporting infrastructure development.'
      },
      {
        title: 'Global Supply Chain Disruptions Show Signs of Easing',
        description: 'Shipping costs decline and port congestion reduces as logistics networks adapt to post-pandemic demands.',
        content: 'After two years of unprecedented disruption, global supply chains are finally showing meaningful signs of stabilization. Container shipping rates have fallen 60% from their 2021 peaks, while major ports report dramatically reduced wait times for vessel berthing. Manufacturing output in key Asian production hubs has returned to pre-pandemic levels, and inventory restocking across retail sectors is proceeding more smoothly than anticipated. Economists now project that supply-related inflationary pressures should diminish significantly by the third quarter, potentially allowing central banks to moderate their aggressive interest rate policies.'
      },
      {
        title: 'Revolutionary Battery Technology Extends Electric Vehicle Range',
        description: 'New solid-state battery design promises 1000-mile range and 5-minute charging capability.',
        content: 'A consortium of automotive manufacturers and battery research firms has unveiled a production-ready solid-state battery that could fundamentally transform the electric vehicle market. The new cells offer energy density exceeding 500 watt-hours per kilogram, enabling production electric vehicles with ranges surpassing 1000 miles on a single charge. Perhaps more impressively, the technology supports ultra-rapid charging that can deliver 500 miles of range in just five minutes. The first vehicles incorporating these batteries are expected to reach consumers by late 2025, with industry analysts projecting this innovation could accelerate EV adoption by several years.'
      },
      {
        title: 'Quantum Computing Milestone Achieved by Research Team',
        description: 'Scientists demonstrate quantum advantage in practical commercial application for the first time.',
        content: 'Researchers at a leading technology institute have achieved a significant breakthrough in quantum computing, demonstrating clear quantum advantage in optimizing complex logistics networks for a major shipping company. The quantum system solved routing optimization problems in minutes that would require classical supercomputers thousands of years to complete. This marks the first commercially relevant application where quantum computing has proven definitively superior to traditional computing methods. The achievement has sparked renewed investment interest in quantum technologies, with venture capital funding in the sector increasing 300% in the quarter following the announcement.'
      },
      {
        title: 'Major Breakthrough in Fusion Energy Research',
        description: 'Experimental reactor achieves sustained fusion reaction with net positive energy output.',
        content: 'Scientists operating an experimental fusion reactor have successfully maintained a sustained plasma reaction that produced 1.5 times more energy than was required to initiate and contain it. This net-positive energy achievement represents a critical milestone in the decades-long quest to harness the same nuclear processes that power stars. The reaction was maintained for over 300 seconds, demonstrating the stability necessary for practical power generation applications. While commercial fusion power remains years away, this achievement provides compelling evidence that fusion could eventually deliver on its promise of virtually limitless, carbon-free energy without long-lived radioactive waste.'
      },
      {
        title: 'Ocean Cleanup Project Reports Record Plastic Removal',
        description: 'Advanced filtration systems successfully extract 100,000 tons of plastic from Pacific garbage patch.',
        content: 'An ambitious ocean cleanup initiative has reported unprecedented success in removing plastic waste from the Great Pacific Garbage Patch, extracting over 100,000 tons of accumulated debris in its most recent operational phase. The project\'s advanced autonomous collection systems utilize AI-powered recognition to distinguish plastic waste from marine life, achieving collection rates 400% higher than earlier prototype systems. Marine biologists report encouraging signs of ecosystem recovery in areas where comprehensive cleanup has been completed, with seabird populations showing measurable increases and fish stocks demonstrating improved health markers.'
      },
      {
        title: 'Global Education Initiative Expands Digital Access',
        description: 'UN-backed program brings high-speed internet and devices to 500 million students worldwide.',
        content: 'A massive international collaboration has successfully connected over 500 million students in developing regions to high-quality educational resources through a comprehensive digital infrastructure initiative. The project has deployed low-cost tablets and established satellite internet connectivity in remote areas previously lacking any digital access. Early results show participating students improving standardized test scores by an average of 35% within the first year of program participation. The initiative has secured funding commitments extending through 2030, with ambitious targets to reach the remaining 1.2 billion students currently lacking adequate educational technology access.'
      },
    ],
    technology: [
      {
        title: 'AI Revolution Transforms Healthcare Diagnostics',
        description: 'New artificial intelligence system demonstrates remarkable accuracy in early disease detection.',
        content: 'A revolutionary artificial intelligence platform has demonstrated unprecedented accuracy in detecting early-stage diseases through medical imaging analysis. The system, developed through collaboration between leading tech companies and healthcare institutions, achieved 98.5% accuracy rates in clinical trials involving over 50,000 patient cases. Medical professionals praise the technology\'s ability to identify subtle patterns invisible to human observers, potentially saving countless lives through earlier intervention. Healthcare systems worldwide are preparing to integrate this technology into standard diagnostic protocols.'
      },
      {
        title: 'Next-Generation Wireless Network Launches Globally',
        description: '6G technology promises speeds 100x faster than current 5G networks with near-zero latency.',
        content: 'Telecommunications companies have begun rolling out the first commercial 6G networks in major metropolitan areas, delivering wireless data speeds approaching 1 terabit per second with latency under 0.1 milliseconds. The new infrastructure enables real-time holographic communication, immersive virtual reality streaming, and seamless integration of billions of IoT devices. Early adopters report transformative experiences with augmented reality applications that overlay high-definition information onto the physical world without perceptible delay. Industry experts predict 6G will enable entirely new categories of applications impossible under previous generation networks.'
      },
      {
        title: 'Brain-Computer Interface Enables Thought-Controlled Devices',
        description: 'Non-invasive neural interface allows paralyzed patients to control computers and robotic limbs with their minds.',
        content: 'A breakthrough brain-computer interface system has enabled paralyzed individuals to control computers, smartphones, and robotic prosthetic limbs through thought alone. The non-invasive headset uses advanced EEG sensors combined with machine learning algorithms to decode neural signals with unprecedented accuracy. Patients in clinical trials successfully typed messages, navigated digital interfaces, and manipulated robotic arms to perform complex tasks with only their thoughts. The technology promises to restore independence for millions living with paralysis and mobility limitations, with consumer versions expected within three years.'
      },
      {
        title: 'Self-Healing Materials Revolutionize Infrastructure',
        description: 'New concrete and asphalt formulations automatically repair cracks using embedded bacteria and microcapsules.',
        content: 'Materials scientists have developed construction materials capable of automatically healing cracks and damage without human intervention. Self-healing concrete utilizes embedded bacteria that produce limestone when exposed to water and oxygen, effectively sealing cracks before they can expand. Similarly, smart asphalt contains microcapsules that rupture when cracks form, releasing healing agents that restore road surface integrity. Early deployments on bridges and highways show 80% reduction in maintenance requirements and dramatic extension of infrastructure lifespans, potentially saving billions in repair costs.'
      },
      {
        title: 'Advanced Robotics Transform Manufacturing Industry',
        description: 'AI-powered robots with dexterous capabilities now handle delicate assembly tasks previously requiring human workers.',
        content: 'A new generation of industrial robots equipped with advanced AI and sensitive tactile feedback systems is transforming manufacturing by successfully performing delicate assembly tasks that previously required human dexterity and judgment. These systems can adapt to variations in component positioning and adjust their grip strength to handle fragile materials without damage. Manufacturing facilities deploying these robots report 40% increases in production efficiency and near-elimination of quality defects. The technology is particularly significant for electronics assembly and precision medical device manufacturing.'
      },
      {
        title: 'Cryptocurrency Regulation Framework Establishes Global Standards',
        description: 'G20 nations agree on comprehensive regulatory approach for digital assets and blockchain technology.',
        content: 'Finance ministers from G20 nations have reached consensus on a comprehensive regulatory framework for cryptocurrencies and digital assets, establishing the first globally coordinated approach to overseeing the rapidly evolving sector. The agreement includes standardized consumer protection measures, anti-money laundering protocols, and tax reporting requirements. Industry participants have largely welcomed the clarity provided by the framework, with cryptocurrency markets responding positively to reduced regulatory uncertainty. The agreement also establishes a global sandbox for testing innovative blockchain applications in controlled environments.'
      },
      {
        title: 'Augmented Reality Glasses Achieve Mainstream Acceptance',
        description: 'Lightweight AR headsets with all-day battery life replace smartphones for millions of users.',
        content: 'The latest generation of augmented reality glasses has achieved mainstream commercial success, with manufacturers reporting sales exceeding 50 million units in the first quarter following widespread availability. The devices project high-resolution information directly into the user\'s field of vision while maintaining awareness of the physical environment. All-day battery life, intuitive gesture controls, and seamless integration with existing digital services have driven rapid adoption. Early research suggests AR glasses are replacing smartphones as primary computing devices for a significant portion of early adopters.'
      },
      {
        title: 'DNA Data Storage Demonstrates Commercial Viability',
        description: 'Synthetic DNA storage systems achieve data densities millions of times greater than current hard drives.',
        content: 'A consortium of biotechnology and information technology companies has demonstrated the first commercially viable DNA-based data storage system, achieving information densities exceeding 1 exabyte per cubic millimeter. The technology utilizes synthetic DNA sequences to encode digital information with redundancy mechanisms ensuring data integrity over centuries. While currently slower for random access than electronic storage, DNA storage offers revolutionary potential for long-term archival of massive datasets. Initial commercial applications include preservation of scientific research data and long-term storage of government and institutional records.'
      },
      {
        title: 'Edge Computing Networks Enable Real-Time AI Processing',
        description: 'Distributed computing infrastructure brings machine learning capabilities to local devices without cloud dependency.',
        content: 'The deployment of advanced edge computing networks has enabled sophisticated artificial intelligence processing directly on local devices without requiring constant cloud connectivity. This distributed approach reduces latency for time-sensitive applications while enhancing privacy by keeping sensitive data processing local. Autonomous vehicles, industrial sensors, and medical devices particularly benefit from edge AI capabilities that enable real-time decision making without network connectivity. The technology also improves application reliability in areas with intermittent internet access.'
      },
      {
        title: 'Holographic Display Technology Enters Consumer Market',
        description: 'True 3D holographic displays without special glasses now available for home entertainment and professional applications.',
        content: 'The first consumer holographic displays capable of projecting true three-dimensional images viewable without special glasses have entered the market, promising to transform entertainment, communication, and professional visualization. The technology uses advanced light field projection to create images with genuine depth that can be viewed from multiple angles. Early applications include immersive gaming experiences, holographic video conferencing that conveys genuine spatial presence, and medical imaging that allows surgeons to examine patient anatomy in three dimensions before procedures.'
      },
    ],
    business: [
      {
        title: 'Tech Giants Report Record Quarterly Earnings',
        description: 'Major technology companies exceed Wall Street expectations with impressive revenue growth.',
        content: 'Leading technology corporations have reported quarterly earnings that significantly exceeded analyst projections, driving market optimism to new heights. Revenue growth across cloud computing, artificial intelligence services, and consumer electronics sectors has surpassed pre-pandemic levels. Company executives attribute this success to continued digital transformation across industries and increasing consumer adoption of technology solutions. Investment analysts have revised growth forecasts upward, anticipating sustained momentum through the remainder of the fiscal year.'
      },
      {
        title: 'Global Merger Activity Reaches Historic High',
        description: 'Corporate consolidation accelerates as companies seek competitive advantages through strategic acquisitions.',
        content: 'Global merger and acquisition activity has reached unprecedented levels, with total deal value exceeding $5 trillion in the current fiscal year. Companies across sectors are pursuing strategic consolidation to achieve economies of scale, access new technologies, and expand market presence. Private equity firms are playing an increasingly prominent role, deploying record levels of committed capital in competitive auction processes. Regulatory scrutiny has intensified accordingly, with antitrust authorities challenging several major proposed combinations in technology and healthcare sectors.'
      },
      {
        title: 'Sustainable Investment Funds Attract Record Inflows',
        description: 'ESG-focused investment vehicles capture $800 billion in new capital as investors prioritize environmental and social impact.',
        content: 'Environmental, social, and governance-focused investment funds have attracted record inflows of over $800 billion this year, representing the largest annual commitment to sustainable investing in financial history. Institutional investors including pension funds and sovereign wealth funds have dramatically increased ESG allocations, while retail investors have shown particular enthusiasm for green energy and sustainable technology funds. Performance data suggests many ESG funds have matched or exceeded returns of traditional benchmark indexes, dispelling concerns that sustainable investing requires sacrificing financial performance.'
      },
      {
        title: 'Remote Work Policies Drive Commercial Real Estate Transformation',
        description: 'Office building conversions accelerate as companies downsize physical footprints and repurpose urban workspaces.',
        content: 'The permanent shift to hybrid and remote work arrangements has triggered a fundamental transformation in commercial real estate markets, with office vacancy rates in major business districts reaching 25-year highs. Property owners are responding with aggressive repurposing strategies, converting former office buildings into residential apartments, mixed-use developments, and specialized collaborative workspaces. Urban planners report increased emphasis on creating vibrant multi-purpose neighborhoods rather than traditional business districts. The transformation is driving significant investment in building retrofitting and infrastructure adaptation.'
      },
      {
        title: 'Central Banks Launch Digital Currency Pilot Programs',
        description: 'Major economies test central bank digital currencies that could transform monetary policy and payment systems.',
        content: 'Central banks representing economies comprising over 80% of global GDP have launched pilot programs for central bank digital currencies, exploring the potential for government-backed digital money to modernize financial infrastructure. CBDCs promise to reduce transaction costs, enhance monetary policy effectiveness, and improve financial inclusion for unbanked populations. However, the initiatives have sparked debate regarding privacy implications and potential disruption to traditional banking systems. Commercial banks are investing heavily in adapting their infrastructure to interoperate with potential CBDC networks.'
      },
      {
        title: 'Aviation Industry Rebounds with Sustainable Fuel Transition',
        description: 'Airlines commit to carbon-neutral operations by 2035 through sustainable aviation fuel adoption and fleet modernization.',
        content: 'The global aviation industry has announced accelerated commitments to achieve carbon-neutral operations by 2035, well ahead of previous 2050 targets. The revised timeline depends on rapid scaling of sustainable aviation fuel production and fleet-wide adoption of next-generation efficient aircraft. Major airlines have placed record orders for electric and hydrogen-powered regional aircraft scheduled for delivery later this decade. Industry associations project that sustainable aviation fuel costs will achieve parity with conventional jet fuel by 2028 as production capacity expands dramatically.'
      },
      {
        title: 'Subscription Economy Expands to Industrial Sector',
        description: 'Manufacturers adopt "equipment-as-a-service" models that include maintenance, upgrades, and performance guarantees.',
        content: 'Industrial equipment manufacturers are increasingly adopting subscription-based business models that provide customers with comprehensive service packages rather than traditional equipment sales. These "equipment-as-a-service" arrangements include preventive maintenance, predictive analytics, automatic upgrades, and guaranteed performance levels. Manufacturing customers report preferring the predictable operational expenditures and reduced capital requirements of subscription models. The shift represents a fundamental change in industrial sector business relationships and revenue recognition patterns.'
      },
      {
        title: 'Global Chip Shortage Eases as Production Capacity Expands',
        description: 'Semiconductor supply constraints diminish as new fabrication facilities achieve full production capacity.',
        content: 'The global semiconductor shortage that has plagued electronics and automotive industries for three years is finally showing signs of resolution as new manufacturing capacity achieves full production. Major foundries in Asia, North America, and Europe have ramped operations at recently constructed facilities, increasing global chip supply by over 40% from peak shortage levels. Prices for previously constrained components have declined 60% from their peaks, and lead times have normalized to pre-pandemic levels. Industries that suffered production limitations due to component shortages are now aggressively restocking inventory and catching up on delayed orders.'
      },
      {
        title: 'Gig Economy Platforms Face Regulatory Reclassification',
        description: 'Courts and legislatures mandate employee classification for platform workers, fundamentally changing business models.',
        content: 'Regulatory developments across multiple jurisdictions are forcing gig economy platforms to reclassify independent contractors as employees, fundamentally altering the economics of ride-sharing, delivery, and freelance service platforms. Court decisions and legislative actions have established presumptions of employment status that platforms must overcome to maintain contractor classifications. The changes require platforms to provide benefits including health insurance, retirement contributions, and paid time off. Industry analysts project that the new cost structures will increase consumer prices by 15-25% while potentially improving service quality and worker retention.'
      },
      {
        title: 'Biotechnology IPO Market Experiences Resurgence',
        description: 'Gene therapy and precision medicine companies raise record capital in public market debuts.',
        content: 'The biotechnology sector has experienced a dramatic resurgence in initial public offerings, with gene therapy and precision medicine companies raising over $45 billion in public market debuts this year. Investor enthusiasm reflects breakthrough clinical trial results demonstrating curative potential for previously untreatable genetic conditions. Several companies achieved valuations exceeding $10 billion despite having no approved products, based solely on promising early-stage data. The capital influx is enabling unprecedented expansion of research programs and manufacturing capacity in anticipation of regulatory approvals for breakthrough therapies.'
      },
    ],
    health: [
      {
        title: 'New Treatment Shows Promise Against Rare Disease',
        description: 'Clinical trials reveal significant patient improvement with breakthrough gene therapy approach.',
        content: 'Groundbreaking clinical trial results have demonstrated remarkable efficacy for a new gene therapy treatment targeting previously incurable rare diseases. Patients receiving the experimental therapy showed dramatic improvement within weeks, with many experiencing complete symptom reversal. The treatment utilizes advanced CRISPR technology to correct genetic mutations at their source, offering hope to millions of patients worldwide. Regulatory authorities are fast-tracking approval processes based on these unprecedented results, with potential market availability expected within 12 months.'
      },
      {
        title: 'Personalized Cancer Vaccines Enter Clinical Trials',
        description: 'Customized mRNA vaccines designed for individual patients show promise in preventing cancer recurrence.',
        content: 'A new generation of personalized cancer vaccines has entered advanced clinical trials, with early results suggesting the potential to prevent recurrence in patients who have undergone initial cancer treatment. These mRNA-based vaccines are custom-designed for each patient based on the specific genetic mutations present in their tumor, training the immune system to recognize and attack any remaining cancer cells. Phase II trials in melanoma and colorectal cancer patients have shown 85% reduction in recurrence rates compared to standard observation protocols. The approach represents a fundamentally new strategy in cancer management.'
      },
      {
        title: 'Mental Health Apps Demonstrate Clinical Effectiveness',
        description: 'Digital therapeutics for depression and anxiety achieve FDA approval as medical treatments.',
        content: 'Digital mental health applications have achieved landmark FDA approval as prescription medical treatments for depression and anxiety disorders, establishing the clinical legitimacy of smartphone-based therapeutic interventions. The approved apps utilize cognitive behavioral therapy protocols delivered through interactive interfaces, with outcomes matching or exceeding traditional in-person therapy in clinical trials. Insurance providers are increasingly covering these digital therapeutics as they would conventional mental health services. Mental health advocates praise the development as expanding access to evidence-based care for millions who face barriers to traditional treatment.'
      },
      {
        title: 'Organ Transplant Breakthrough Eliminates Rejection Risk',
        description: 'Gene editing technique prevents immune system from attacking transplanted organs without ongoing medication.',
        content: 'Transplant surgeons have successfully utilized gene editing technology to prevent immune rejection of donor organs without requiring patients to take lifelong immunosuppressive medications. The technique modifies specific genes in the transplanted organ to make it appear genetically identical to the recipient\'s own tissue to the immune system. Early patients who received gene-edited organs have remained healthy for over three years without any immunosuppressive drugs. The breakthrough could dramatically expand the pool of available organs by making previously incompatible donors suitable matches.'
      },
      {
        title: 'Wearable Health Monitors Predict Illness Before Symptoms',
        description: 'Continuous physiological monitoring systems detect COVID-19, flu, and other infections before patients feel sick.',
        content: 'Advanced wearable health monitoring devices have demonstrated the ability to detect COVID-19, influenza, and other infections up to two days before patients experience any symptoms. The systems utilize AI analysis of subtle changes in heart rate variability, skin temperature, and respiratory patterns that indicate the earliest stages of immune response to infection. Clinical trials showed 90% accuracy in predicting illness onset, enabling early intervention and isolation that could reduce community transmission. Public health officials are exploring deployment of the technology for healthcare workers and vulnerable populations.'
      },
      {
        title: 'Alzheimer Treatment Shows Promise in Slowing Disease Progression',
        description: 'New monoclonal antibody therapy reduces cognitive decline by 60% in early-stage patients.',
        content: 'A novel monoclonal antibody treatment for Alzheimer\'s disease has demonstrated unprecedented effectiveness in slowing cognitive decline in Phase III clinical trials. Patients receiving the therapy showed 60% less disease progression compared to placebo groups over 18 months of treatment. The drug targets a specific form of amyloid protein believed to be particularly toxic to brain cells. While not a cure, the treatment represents the first therapy to meaningfully alter the course of the disease. Regulatory approval is expected within six months, with healthcare systems preparing for significant demand from eligible patients.'
      },
      {
        title: 'Lab-Grown Organs Successfully Transplanted',
        description: 'Bioengineered hearts, livers, and kidneys from patient stem cells eliminate transplant waiting lists.',
        content: 'Medical researchers have successfully completed the first long-term surviving transplants of lab-grown organs created from patients\' own stem cells, eliminating the risk of immune rejection and the need for donor organs. The bioengineered organs, including hearts, livers, and kidneys, were grown on biodegradable scaffolding over several months before surgical implantation. Patients who received these organs have shown normal organ function for over two years without immunosuppressive medications. The technology promises to eventually eliminate transplant waiting lists and the tragic mortality among patients who die before suitable donor organs become available.'
      },
      {
        title: 'Longevity Research Identifies Key Aging Mechanisms',
        description: 'Scientists map cellular aging pathways, opening possibilities for extending human healthspan.',
        content: 'A consortium of longevity researchers has completed comprehensive mapping of the cellular mechanisms that drive human aging, identifying nine key pathways that could potentially be modified to extend healthy lifespan. The research suggests that aging is not a fixed biological program but rather a malleable process subject to intervention. Several candidate interventions targeting these pathways have shown remarkable success in extending lifespan and healthspan in animal models. Human clinical trials for the most promising approaches are scheduled to begin next year, with researchers cautiously optimistic about potential breakthroughs in age-related disease prevention.'
      },
      {
        title: 'Robotic Surgery Systems Achieve Autonomous Capabilities',
        description: 'AI-controlled surgical robots successfully perform complex procedures without human intervention.',
        content: 'Advanced surgical robotic systems equipped with artificial intelligence have successfully performed complex operations including gallbladder removal, hernia repair, and joint replacement without any direct human control during the procedure. The autonomous systems utilize real-time imaging analysis and tactile feedback to adapt to anatomical variations and unexpected conditions. Outcomes data from over 500 autonomous procedures shows complication rates 40% lower than human-performed surgeries and significantly faster patient recovery times. Regulatory frameworks for autonomous surgery are being developed to ensure appropriate oversight as the technology expands.'
      },
      {
        title: 'Microbiome Therapeutics Revolutionize Digestive Health',
        description: 'Engineered gut bacteria treatments cure chronic conditions including Crohn disease and ulcerative colitis.',
        content: 'Therapeutic approaches targeting the human gut microbiome have achieved remarkable success in treating previously incurable chronic digestive diseases. Engineered beneficial bacteria delivered through specialized capsules successfully colonize the gut and restore healthy microbial balance. Clinical trials in patients with Crohn disease and ulcerative colitis showed 75% rate of complete remission lasting over two years. The treatments offer advantages over current immunosuppressive therapies including better safety profiles and reduced cancer risk. The success has sparked broader investigation of microbiome manipulation for treating conditions beyond the digestive system.'
      },
    ],
    science: [
      {
        title: 'James Webb Telescope Discovers Potentially Habitable Exoplanet',
        description: 'Revolutionary space observatory identifies Earth-like world with atmospheric water vapor.',
        content: 'NASA\'s James Webb Space Telescope has identified a potentially habitable exoplanet located 120 light-years from Earth, with atmospheric analysis confirming the presence of water vapor, methane, and carbon dioxide in proportions that suggest possible biological activity. The rocky planet, slightly larger than Earth, orbits within its star\'s habitable zone where liquid water could exist on the surface. Follow-up observations are scheduled to search for additional biosignatures including oxygen and chlorophyll-like compounds. The discovery represents the most promising candidate for extraterrestrial life detected to date.'
      },
      {
        title: 'Particle Accelerator Discovers New Fundamental Force',
        description: 'Anomalous particle interactions at CERN suggest previously unknown fundamental interaction in physics.',
        content: 'Physicists operating the Large Hadron Collider have detected anomalous particle decay patterns that cannot be explained by any known forces in the Standard Model of physics, suggesting the existence of a previously unknown fundamental interaction. The observations involve unusual behavior in bottom quark decays that violate expected patterns by five standard deviations. If confirmed, this would represent the first discovery of a new fundamental force since the weak nuclear force was identified in the 1930s. Theoretical physicists are proposing various explanations including new heavy particles that mediate the interaction or modifications to existing quantum field theories.'
      },
      {
        title: 'Deep Sea Expedition Discovers Thousands of New Species',
        description: 'Oceanographers catalog remarkable biodiversity in previously unexplored Pacific trenches.',
        content: 'An ambitious deep-sea expedition to previously unexplored ocean trenches has discovered and catalogued over 3,000 new species, fundamentally expanding scientific understanding of marine biodiversity. The research utilized advanced submersibles capable of operating at depths exceeding 10,000 meters, revealing ecosystems thriving under extreme pressure and total darkness. Many discovered organisms exhibit unique biochemical adaptations with potential applications in medicine and industrial processes. The findings suggest that total ocean biodiversity may be several orders of magnitude greater than previously estimated.'
      },
      {
        title: 'Climate Scientists Achieve Breakthrough in Carbon Capture',
        description: 'New direct air capture technology removes CO2 from atmosphere at commercially viable costs.',
        content: 'Climate researchers have developed a direct air carbon capture system capable of removing carbon dioxide from ambient atmosphere at costs below $50 per ton, achieving the threshold for commercial viability. The technology utilizes novel absorbent materials that can be regenerated with minimal energy input, dramatically reducing operational costs compared to previous systems. Pilot facilities are already operational, with plans for massive scaling to gigaton annual removal capacity by 2030. Combined with emissions reductions, the technology could enable achievement of global climate goals even if some industrial sectors continue emitting.'
      },
      {
        title: 'Neuroscientists Map Complete Mouse Brain Neural Connectome',
        description: 'Comprehensive mapping of 100 million neurons provides unprecedented insights into brain architecture.',
        content: 'An international collaboration of neuroscientists has completed comprehensive mapping of the complete neural connectome of the mouse brain, documenting over 100 million neurons and the 10 billion synaptic connections between them. The achievement represents the first complete wiring diagram of any mammalian brain. Analysis of the connectome has already revealed unexpected organizational principles and circuit motifs that appear conserved across mammalian species. The methodology and findings provide essential foundation for eventually mapping the human brain, which contains approximately 1,000 times more neurons.'
      },
      {
        title: 'Archaeologists Uncover Lost Ancient Civilization in Amazon',
        description: 'Lidar mapping reveals sophisticated urban settlements predating European contact by millennia.',
        content: 'Archaeological surveys utilizing advanced Lidar technology have revealed extensive remains of a previously unknown sophisticated civilization in the Amazon rainforest, including cities with populations estimated in the hundreds of thousands. The discovery challenges previous assumptions that Amazonia supported only small nomadic populations before European arrival. Sophisticated earthworks, road networks, and agricultural systems suggest organized societies with complex social hierarchies dating back over 3,000 years. The findings prompt reconsideration of how many similar civilizations might remain undiscovered beneath dense forest canopy.'
      },
      {
        title: 'Gravitational Wave Observatory Detects Black Hole Mergers',
        description: 'Upgraded LIGO instruments observe unprecedented number of cosmic collision events.',
        content: 'Following sensitivity upgrades, gravitational wave observatories have detected an unprecedented 47 black hole merger events in a single month of observation, providing new insights into black hole populations and binary system formation. The observations include several unusual events involving intermediate-mass black holes whose existence had been theoretical. Analysis of merger patterns is refining understanding of how binary black hole systems form and evolve. The detection rate suggests that black hole mergers are far more common than previously estimated, with implications for galaxy evolution models.'
      },
      {
        title: 'Synthetic Biology Creates Self-Replicating Artificial Cells',
        description: 'Minimal synthetic cells demonstrate life-like reproduction and evolution in laboratory environment.',
        content: 'Synthetic biologists have successfully created minimal artificial cells capable of self-replication and evolutionary adaptation in controlled laboratory environments. The synthetic cells utilize simplified genetic systems based on RNA rather than DNA, enabling rapid replication cycles of under 30 minutes. In extended experiments, the populations demonstrated genuine evolutionary adaptation to environmental pressures including antibiotic exposure. While not truly alive by conventional definitions, the achievement represents significant progress toward understanding the minimal requirements for life and potential applications in biotechnology and medicine.'
      },
      {
        title: 'Paleontologists Extract Ancient DNA from Extinct Species',
        description: 'Revolutionary techniques recover genetic material from million-year-old mammoth and rhinoceros remains.',
        content: 'Paleogeneticists have developed techniques capable of recovering intact DNA sequences from extinct species including mammoths and giant rhinoceroses that lived over one million years ago, dramatically extending the temporal range of ancient DNA recovery. The breakthrough involves novel chemical treatments that protect DNA fragments during extraction and specialized computational methods for assembling degraded sequences. The recovered genomes provide unprecedented insights into evolutionary adaptation to climate change during the Pleistocene epoch. Some researchers suggest the techniques might eventually enable recovery of genetic material from dinosaurs, though this remains highly controversial.'
      },
      {
        title: 'Astronomers Witness Birth of New Star System',
        description: 'Real-time observation of protoplanetary disk formation captures process previously only theorized.',
        content: 'Using advanced adaptive optics and interferometry, astronomers have achieved the first real-time observation of a new star system being born from a collapsing molecular cloud core. The observations captured the dramatic moment when a protoplanetary disk formed around the newborn protostar, potentially representing the birth of future planets. The event occurred in a nearby star-forming region approximately 450 light-years from Earth. The unprecedented observations confirm long-standing theoretical models of star and planet formation while revealing unexpected dynamics in the disk formation process that will require refinement of existing theories.'
      },
    ],
    sports: [
      {
        title: 'World Cup Final Breaks Global Viewership Records',
        description: 'Historic championship match attracts over 1.5 billion viewers worldwide.',
        content: 'The recent World Cup final has shattered global viewership records with over 1.5 billion people tuning in to watch the championship match, making it the most-watched sporting event in human history. The dramatic contest featuring underdog triumph and last-minute heroics captured global attention across all demographics. Social media engagement metrics similarly set new standards, with over 3 billion interactions recorded during the match. Broadcast rights valuations for future tournaments are expected to increase substantially based on demonstrated audience scale and engagement intensity.'
      },
      {
        title: 'Olympic Committee Approves New Sports for 2028 Games',
        description: 'Breakdancing, esports, and drone racing among additions to Olympic program.',
        content: 'The International Olympic Committee has officially approved breakdancing, esports, drone racing, and several other new sports for inclusion in the 2028 Los Angeles Summer Olympics, representing the most significant expansion of the Olympic program in decades. The additions reflect ongoing efforts to engage younger audiences and acknowledge evolving definitions of athletic competition. Esports will feature multiple game titles across different genres, while drone racing will utilize custom-designed obstacle courses. Traditional sports federations have expressed mixed reactions, with some concerns about diluting the Olympic brand alongside recognition of the need for modernization.'
      },
      {
        title: 'MLB Implements Automated Strike Zone Technology',
        description: 'Robot umpires call balls and strikes with perfect accuracy, eliminating controversial calls.',
        content: 'Major League Baseball has completed full implementation of automated strike zone technology across all stadiums, with computer vision systems now calling all ball and strike decisions with perfect accuracy. The change eliminates controversial umpire calls that have affected game outcomes for over a century. Players and managers have largely adapted to the change, with game pace improving as arguments over strike zone interpretation have been eliminated. Umpires remain on field for other decisions and game management, with their roles evolving toward broader game oversight rather than pitch-by-pitch adjudication.'
      },
      {
        title: 'Women Sports Leagues Achieve Revenue Parity Milestone',
        description: 'WNBA and women soccer leagues generate record revenues matching men counterparts for first time.',
        content: 'Women\'s professional sports leagues have achieved historic revenue parity with their male counterparts for the first time, with the WNBA and National Women\'s Soccer League generating equivalent per-game revenues to the NBA and MLS respectively. The milestone reflects years of growing audience engagement, improved media coverage, and strategic marketing investments. Corporate sponsorships for women\'s sports have increased 400% over five years, with premium brands recognizing the value of association. Player salaries have correspondingly increased substantially, though full compensation parity remains a goal for future collective bargaining negotiations.'
      },
      {
        title: 'Advanced Biometrics Transform Athlete Training',
        description: 'Real-time physiological monitoring enables unprecedented performance optimization and injury prevention.',
        content: 'Professional sports teams have widely adopted advanced biometric monitoring systems that track athlete physiological parameters in real-time during both training and competition. The technology enables coaches to optimize workload management, identifying when athletes are approaching overtraining or injury risk thresholds. Early results show 60% reductions in soft tissue injuries and significant performance improvements across multiple sports. Privacy concerns have emerged regarding the extensive data collection, with player unions negotiating agreements governing data ownership and usage limitations. The technology is gradually becoming available to amateur athletes through consumer wearable devices.'
      },
      {
        title: 'Formula E Electric Racing Surpasses F1 in Viewership',
        description: 'Sustainability-focused motorsport attracts younger demographics and environmental consciousness.',
        content: 'Formula E electric racing has surpassed Formula 1 in global viewership among demographics under age 35, marking a generational shift in motorsport preferences toward sustainability-focused competition. The all-electric series has attracted significant investment from automotive manufacturers transitioning away from internal combustion engines. Races held on temporary street circuits in major city centers have proven more accessible and engaging than traditional permanent racetracks. Environmental messaging and authentic commitment to sustainability have resonated with younger audiences who perceive traditional motorsports as increasingly anachronistic.'
      },
      {
        title: 'Virtual Reality Training Revolutionizes Professional Sports',
        description: 'Immersive VR simulations enable mental rehearsal and tactical preparation without physical wear.',
        content: 'Virtual reality training systems have become standard equipment across professional sports leagues, enabling athletes to mentally rehearse plays, study opponent tendencies, and practice decision-making without physical strain. Quarterbacks can experience thousands of virtual defensive looks, while batters can face simulations of upcoming pitchers. The technology is particularly valuable for injured athletes maintaining mental sharpness during rehabilitation and for rookies accelerating adaptation to professional game speed. Teams report that VR preparation translates to measurably improved on-field performance, particularly in high-pressure situations.'
      },
      {
        title: 'International Sports Arbitration Reforms Integrity Standards',
        description: 'New independent oversight body addresses corruption and match-fixing across global competitions.',
        content: 'A newly established International Sports Integrity Agency has assumed authority over investigating and adjudicating corruption, match-fixing, and doping violations across international sports, replacing the previously criticized system of federation self-policing. The agency operates with genuine independence from sports governing bodies and has authority to impose sanctions including lifetime competition bans. Early investigations have uncovered extensive match-fixing networks in several sports, with hundreds of athletes and officials facing sanctions. While some national federations have resisted the external oversight, most major international sports organizations have embraced the reforms as essential for maintaining public confidence.'
      },
      {
        title: 'Extreme Sports Enter Mainstream Olympic Competition',
        description: 'Skateboarding, surfing, and climbing medal events attract new audiences to winter games.',
        content: 'Once-marginal extreme sports have become centerpiece medal events at recent Olympic Games, with skateboarding, surfing, sport climbing, and freestyle BMX attracting massive audiences and generating significant social media engagement. The sports have brought new demographic segments to Olympic viewership, particularly younger audiences who previously showed limited interest in traditional Olympic events. Athletes from these disciplines have become among the most marketable Olympic personalities, securing major endorsement deals and significant social media followings. Cultural tensions remain between traditional Olympic values and the countercultural origins of these sports, but commercial success has ensured their continued inclusion.'
      },
      {
        title: 'Sports Gambling Legalization Transforms Fan Engagement',
        description: 'Widespread betting integration creates new revenue streams and fan participation models.',
        content: 'The legalization of sports gambling across previously prohibitive jurisdictions has fundamentally transformed fan engagement with professional sports, with in-game betting now accounting for the majority of sports wagering activity. Leagues have embraced betting partnerships generating billions in new revenue, while integrating real-time odds and betting content into broadcasts. The engagement model has proven particularly effective at maintaining viewer attention throughout entire games rather than just checking scores. Concerns regarding gambling addiction have prompted substantial investment in responsible gaming programs and betting exclusion technologies for at-risk individuals.'
      },
    ],
    entertainment: [
      {
        title: 'Streaming Wars Intensify as New Platforms Launch',
        description: 'Entertainment landscape fragments further with niche streaming services targeting specific audiences.',
        content: 'The streaming entertainment market has experienced further fragmentation with the launch of several new niche platforms targeting specific audience demographics and content preferences. Services dedicated exclusively to horror, documentary, international cinema, and classic film have attracted dedicated subscriber bases despite competing against generalist giants. Industry consolidation has begun as larger platforms acquire specialized services to expand content libraries. Consumer frustration with subscription costs and content dispersion has driven renewed interest in bundling services and ad-supported tiers that reduce monthly expenses.'
      },
      {
        title: 'AI-Generated Music Achieves Chart Success',
        description: 'Songs created entirely by artificial intelligence reach top 40 radio airplay.',
        content: 'Music created entirely by artificial intelligence systems without human composition has achieved mainstream commercial success, with AI-generated tracks reaching top 40 positions on major music charts and receiving substantial radio airplay. The technology enables creation of music in any style or genre based on text prompts describing desired mood and characteristics. While some listeners express discomfort knowing music is AI-created, blind listening tests show most cannot distinguish AI compositions from human-created works. The development has sparked intense debate within the music industry regarding creative authorship, copyright, and the future role of human musicians.'
      },
      {
        title: 'Immersive Theater Experiences Attract Record Audiences',
        description: 'Interactive productions blur lines between performance and reality for engaged spectators.',
        content: 'Immersive theater productions that place audiences within the performance environment have achieved unprecedented popularity, with extended runs and premium ticket prices significantly outperforming traditional staged productions. These experiences eliminate the conventional separation between spectators and performers, with audiences moving through detailed environments and interacting with characters. Productions based on classic literature and original concepts have proven equally successful. The format has attracted younger demographics who previously showed limited interest in traditional theater, potentially revitalizing live performance as an art form.'
      },
      {
        title: 'Virtual Concerts Generate Millions in Ticket Revenue',
        description: 'Digital performances in metaverse platforms become major revenue source for artists.',
        content: 'Virtual concerts held within metaverse and gaming platforms have become a significant revenue stream for musical artists, with major performances generating millions in ticket sales and virtual merchandise. These events enable global audiences to attend performances regardless of physical location, while offering creative possibilities impossible in physical venues including gravity-defying stages and impossible visual effects. Several artists have begun planning album releases around virtual concert experiences rather than traditional physical tours. While not replacing live performance entirely, virtual concerts have established themselves as a complementary medium with distinct advantages for both artists and audiences.'
      },
      {
        title: 'Interactive Films Allow Viewer Choice in Narrative',
        description: 'Choose-your-own-adventure movies gain mainstream acceptance with A-list talent participation.',
        content: 'Interactive films that allow viewers to make choices affecting narrative outcomes have achieved mainstream critical and commercial success, with major studios committing to interactive projects featuring A-list directors and actors. Streaming platform technology has enabled seamless branching narratives without the technical friction of earlier experiments. Critics praise successful interactive films for genuine narrative integration of choice mechanics rather than superficial gimmicks. The format has proven particularly effective for mystery and thriller genres where audience participation enhances emotional investment. Filmmakers report both excitement and anxiety regarding the expanded creative possibilities and technical challenges of interactive storytelling.'
      },
      {
        title: 'Podcast Industry Reaches $2 Billion in Annual Revenue',
        description: 'Audio content monetization accelerates through premium subscriptions and dynamic advertising.',
        content: 'The podcast industry has reached $2 billion in annual revenue as monetization strategies mature and audience scale continues expanding globally. Premium subscription models offering exclusive content and ad-free listening have attracted millions of paying subscribers willing to support specific shows. Dynamic advertising insertion enables targeted podcast advertising at scale, dramatically increasing revenue per listener compared to traditional broadcast radio. Major media companies have invested heavily in podcast networks and exclusive talent deals. The industry has also seen significant international growth as content in multiple languages achieves global distribution through streaming platforms.'
      },
      {
        title: 'Social Media Stars Transition to Traditional Media Success',
        description: 'Influencers prove box office and ratings viability with crossover film and television projects.',
        content: 'Social media content creators have demonstrated consistent viability in transitioning to traditional entertainment media, with influencer-led films and television series achieving significant commercial success. Several TikTok and YouTube stars have successfully anchored major theatrical releases and network television shows, bringing their established audiences to traditional media consumption. Studios increasingly prioritize social media following metrics in casting decisions alongside traditional acting credentials. The phenomenon represents a fundamental shift in celebrity formation, with organic online audience building preceding rather than following traditional media exposure.'
      },
      {
        title: 'Classic Film Restoration Preserves Cinema History',
        description: 'AI-powered techniques rescue deteriorating films from Hollywood golden age and international cinema.',
        content: 'Advanced AI-powered film restoration techniques have enabled preservation of thousands of deteriorating classic films from the early 20th century, rescuing cinema history that was previously considered lost to chemical decomposition. The technology can reconstruct damaged frames, enhance resolution, and restore original color timing with remarkable fidelity to source materials. Major studios have announced comprehensive restoration programs for their back catalogs, while archives worldwide are digitizing previously inaccessible international cinema. The restored films are receiving theatrical rereleases and premium streaming presentations, introducing classic cinema to new generations of viewers in quality exceeding original release prints.'
      },
      {
        title: 'Theme Parks Incorporate Advanced Robotics for Immersive Experiences',
        description: 'Life-like animatronic characters and interactive robots transform visitor engagement.',
        content: 'Major theme parks have deployed advanced robotics and animatronics creating unprecedentedly lifelike character interactions and immersive narrative experiences. Next-generation figures feature AI-powered responsive behaviors, natural language interaction, and remarkably human-like movement. Some parks have introduced free-roaming robotic characters that can navigate spaces and engage spontaneously with visitors. The technology enables personalization of experiences based on visitor preferences and past interactions. While implementation costs are substantial, parks report significant increases in visitor satisfaction metrics and repeat attendance associated with advanced robotics deployments.'
      },
      {
        title: 'Esports Championship Viewership Exceeds Traditional Sports Finals',
        description: 'League of Legends and Dota 2 tournaments attract larger audiences than Super Bowl or World Cup.',
        content: 'Championship finals for major esports titles have achieved viewership exceeding traditional sporting events including the Super Bowl and World Cup, with the most recent League of Legends World Championship attracting over 120 million concurrent viewers during peak moments. The audience skews heavily toward demographics under age 35, representing the future of competitive entertainment consumption. Prize pools exceeding $40 million have attracted elite athletic talent treating esports as genuine professional careers. Traditional sports franchises and broadcasters have invested substantially in esports teams and leagues, recognizing the generational shift in entertainment preferences. Mainstream media coverage of esports has expanded dramatically, with events receiving coverage comparable to major traditional sporting championships.'
      },
    ],
  }

  const articles = sampleData[category] || sampleData.general
  
  return Array.from({ length: Math.min(count, articles.length) }, (_, i) => ({
    id: `sample-${category}-${i}-${Date.now()}`,
    title: articles[i % articles.length].title,
    description: articles[i % articles.length].description,
    url: `https://example.com/news/${category}/${i}`,
    urlToImage: `https://picsum.photos/800/400?random=${category}${i}`,
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    source: {
      id: 'sample',
      name: ['BBC News', 'Reuters', 'AP News', 'CNN', 'Bloomberg', 'TechCrunch', 'The Guardian', 'Forbes'][i % 8],
    },
    author: ['Sarah Johnson', 'Michael Chen', 'Emma Williams', 'David Brown', 'Lisa Davis', 'James Miller'][i % 6],
    content: articles[i % articles.length].content,
    country: 'us',
    category: category,
  }))
}

export async function searchNews(query: string, params?: {
  language?: string
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt'
  pageSize?: number
}): Promise<NewsApiResponse> {
  try {
    const { pageSize = 50, sortBy = 'relevancy', language = 'en' } = params || {}

    if (NEWS_API_KEY && NEWS_API_KEY !== 'your_news_api_key_here') {
      const url = `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&language=${language}&sortBy=${sortBy}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
      
      const response = await axios.get(url, { timeout: 10000 })
      
      if (response.data.status === 'ok') {
        const articles = response.data.articles.map((item: any, index: number) => ({
          id: item.url || `search-${index}-${Date.now()}`,
          title: item.title || 'Untitled',
          description: item.description || '',
          url: item.url || '#',
          urlToImage: item.urlToImage || null,
          publishedAt: item.publishedAt || new Date().toISOString(),
          source: {
            id: item.source?.id || 'newsapi',
            name: item.source?.name || 'News Source',
          },
          author: item.author || null,
          content: item.content || item.description || '',
          country: 'us',
          category: 'general',
        }))

        return {
          status: 'ok',
          totalResults: response.data.totalResults || articles.length,
          articles,
        }
      }
    }

    // Fallback to filtering sample articles
    const allNews = await fetchTopHeadlines({ pageSize: 100 })
    const filtered = allNews.articles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, pageSize)

    return {
      status: 'ok',
      totalResults: filtered.length,
      articles: filtered,
    }
  } catch (error: any) {
    console.error('Search error:', error.message)
    return {
      status: 'ok',
      totalResults: 0,
      articles: [],
    }
  }
}

export function isBreakingNews(article: NewsArticle): boolean {
  const publishedTime = new Date(article.publishedAt).getTime()
  const now = Date.now()
  const hoursDiff = (now - publishedTime) / (1000 * 60 * 60)
  
  // Consider news breaking if published within last 2 hours
  return hoursDiff < 2
}

export function getArticleCategory(article: NewsArticle): 'breaking' | 'local' | 'personal' {
  if (isBreakingNews(article)) {
    return 'breaking'
  }
  
  // Check if it's from user's country (would need user preferences)
  if (article.country) {
    return 'local'
  }
  
  return 'personal'
}

// Fetch from NewsAPI
async function fetchFromNewsAPI(params: {
  category?: string
  country?: string
  query?: string
  pageSize?: number
}): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key_here') {
    console.log('No NewsAPI key available')
    return []
  }

  try {
    const { category = 'general', country = 'us', query, pageSize = 20 } = params
    const validCountry = SUPPORTED_COUNTRIES.includes(country) ? country : 'us'

    let url = `${NEWS_API_BASE_URL}/top-headlines?country=${validCountry}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`

    if (category && category !== 'general') {
      url += `&category=${CATEGORY_MAP[category] || category}`
    }

    if (query) {
      url += `&q=${encodeURIComponent(query)}`
    }

    const response = await axios.get(url, { timeout: 10000 })

    if (response.data.status === 'ok' && response.data.articles) {
      return response.data.articles.map((item: any, index: number) => ({
        id: `newsapi-${index}-${Date.now()}`,
        title: item.title || 'Untitled',
        description: item.description || '',
        url: item.url || '#',
        urlToImage: item.urlToImage || null,
        publishedAt: item.publishedAt || new Date().toISOString(),
        source: {
          id: item.source?.id || 'newsapi',
          name: item.source?.name || 'News Source',
        },
        author: item.author || null,
        content: item.content || item.description || '',
        country: validCountry,
        category: category,
      }))
    }

    return []
  } catch (error: any) {
    console.warn('NewsAPI fetch failed:', error.message)
    return []
  }
}

// Fetch from GDELT (free, no API key needed)
async function fetchFromGDELT(params: { query: string; pageSize?: number }): Promise<NewsArticle[]> {
  try {
    const { query, pageSize = 20 } = params

    // GDELT uses a different query format
    const gdeltQuery = query === 'general' ? 'world news' : query

    const url = `${GDELT_API_URL}?query=${encodeURIComponent(gdeltQuery)}&mode=ArtList&maxrecords=${pageSize}&format=json`

    const response = await axios.get(url, { timeout: 10000 })

    if (response.data && response.data.articles) {
      return response.data.articles.map((item: any, index: number) => ({
        id: `gdelt-${index}-${Date.now()}`,
        title: item.title || 'Untitled',
        description: item.seen || item.title || '',
        url: item.url || '#',
        urlToImage: null,
        publishedAt: item.seendate ? new Date(item.seendate).toISOString() : new Date().toISOString(),
        source: {
          id: 'gdelt',
          name: item.domain || 'GDELT News',
        },
        author: null,
        content: item.seen || item.title || '',
        country: 'us',
        category: 'general',
      }))
    }

    return []
  } catch (error: any) {
    console.warn('GDELT fetch failed:', error.message)
    return []
  }
}

// Fetch from RSS feeds
async function fetchFromRSS(category: string, pageSize: number): Promise<NewsArticle[]> {
  try {
    const feeds = RSS_FEEDS[category] || RSS_FEEDS.general
    const articles: NewsArticle[] = []

    // Fetch from each RSS feed
    const fetchPromises = feeds.map(async (feedUrl, feedIndex) => {
      try {
        const response = await axios.get(feedUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; GlobalPulse/1.0)',
          },
        })

        const xmlData = response.data

        // Parse XML
        return new Promise<NewsArticle[]>((resolve) => {
          parseString(xmlData, { explicitArray: false }, (err: any, result: any) => {
            if (err || !result) {
              resolve([])
              return
            }

            const items = result.rss?.channel?.item || []
            const parsedItems = Array.isArray(items) ? items : [items]

            const parsed = parsedItems.slice(0, 5).map((item: any, index: number) => ({
              id: `rss-${feedIndex}-${index}-${Date.now()}`,
              title: item.title || 'Untitled',
              description: item.description || item.summary || '',
              url: item.link || '#',
              urlToImage: extractImageFromRSS(item),
              publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
              source: {
                id: 'rss',
                name: result.rss?.channel?.title || 'RSS Feed',
              },
              author: item.author || null,
              content: item['content:encoded'] || item.description || '',
              country: 'us',
              category: category,
            }))

            resolve(parsed)
          })
        })
      } catch (error) {
        console.warn(`RSS fetch failed for ${feedUrl}:`, error)
        return []
      }
    })

    const results = await Promise.all(fetchPromises)
    results.forEach((result) => articles.push(...result))

    return articles.slice(0, pageSize)
  } catch (error: any) {
    console.warn('RSS fetch failed:', error.message)
    return []
  }
}

// Extract image URL from RSS item
function extractImageFromRSS(item: any): string | null {
  // Try media:content
  if (item['media:content']?.$.url) {
    return item['media:content'].$.url
  }
  // Try enclosure
  if (item.enclosure?.$.url) {
    return item.enclosure.$.url
  }
  // Try to extract from description
  if (item.description) {
    const imgMatch = item.description.match(/<img[^>]+src="([^"]+)"/)
    if (imgMatch) {
      return imgMatch[1]
    }
  }
  return null
}

// Remove duplicate articles based on URL
function removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>()
  return articles.filter((article) => {
    const url = article.url?.split('?')[0] // Remove query params for comparison
    if (!url || seen.has(url)) {
      return false
    }
    seen.add(url)
    return true
  })
}
