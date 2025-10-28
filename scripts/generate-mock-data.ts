// Script to generate 15 mock user profiles with realistic data
import { saveUserProfile, generateUserId, generateBadges } from "@/lib/storage"

const mockNames = [
  { display: "Alex Chen", username: "alexchen" },
  { display: "Jordan Smith", username: "jordansmith" },
  { display: "Taylor Johnson", username: "taylorj" },
  { display: "Morgan Lee", username: "morganlee" },
  { display: "Casey Williams", username: "caseyw" },
  { display: "Riley Brown", username: "rileybrown" },
  { display: "Avery Davis", username: "averydavis" },
  { display: "Quinn Martinez", username: "quinnm" },
  { display: "Sage Anderson", username: "sageand" },
  { display: "River Taylor", username: "rivertaylor" },
  { display: "Phoenix White", username: "phoenixw" },
  { display: "Dakota Green", username: "dakotag" },
  { display: "Skylar Harris", username: "skylarh" },
  { display: "Cameron Clark", username: "cameronc" },
  { display: "Blake Robinson", username: "blaker" },
]

const bios = [
  "Building the future, one line of code at a time",
  "Designer, developer, and dreamer",
  "Passionate about creating beautiful digital experiences",
  "Tech enthusiast and startup founder",
  "Open source contributor and community builder",
  "AI researcher exploring new possibilities",
  "Full-stack developer with a design mindset",
  "Helping startups scale with technology",
  "Creative technologist and innovator",
  "Building tools that matter",
]

const interests = [
  ["Design", "Web3", "Startups"],
  ["AI", "Machine Learning", "Data Science"],
  ["React", "Next.js", "TypeScript"],
  ["Product", "UX", "Design Systems"],
  ["DevOps", "Cloud", "Infrastructure"],
  ["Mobile", "iOS", "Flutter"],
  ["Backend", "Databases", "APIs"],
  ["Security", "Privacy", "Blockchain"],
  ["Marketing", "Growth", "Analytics"],
  ["Leadership", "Mentoring", "Community"],
]

const links = [
  { title: "GitHub", url: "https://github.com" },
  { title: "Twitter", url: "https://twitter.com" },
  { title: "Portfolio", url: "https://example.com" },
  { title: "LinkedIn", url: "https://linkedin.com" },
]

export function generateMockData() {
  if (typeof window === "undefined") return

  const existingUsers = localStorage.getItem("allUsers")
  if (existingUsers && JSON.parse(existingUsers).length > 0) {
    console.log("Mock data already exists")
    return
  }

  const now = Date.now()
  const mockUsers = mockNames.map((name, index) => {
    const userId = generateUserId()
    const views = Math.floor(Math.random() * 500) + 10
    const votes = Math.floor(Math.random() * 100) + 5
    const streak = Math.floor(Math.random() * 30) + 1
    const createdAt = now - Math.random() * 30 * 24 * 60 * 60 * 1000

    const user = {
      id: userId,
      username: name.username,
      displayName: name.display,
      bio: bios[index % bios.length],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.username}`,
      links: [links[Math.floor(Math.random() * links.length)]],
      interests: interests[index % interests.length],
      views,
      votes,
      rank: index + 1,
      createdAt,
      badges: [],
      streak,
      lastActiveDate: now,
      dailyViews: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(now - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        count: Math.floor(Math.random() * 50),
      })),
      dailyVotes: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(now - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        count: Math.floor(Math.random() * 10),
      })),
    }

    user.badges = generateBadges(user)
    return user
  })

  mockUsers.forEach((user) => saveUserProfile(user))
  console.log("Generated 15 mock user profiles")
}
