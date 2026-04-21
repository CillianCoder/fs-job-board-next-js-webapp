export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  postedAt: string;
}

export const jobs: Job[] = [
  {
    id: "1",
    title: "Senior Full Stack Engineer",
    company: "TechNova",
    location: "San Francisco, CA (Hybrid)",
    salary: "$140k - $180k",
    type: "Full-time",
    tags: ["React", "Node.js", "TypeScript"],
    postedAt: "2023-10-24T10:00:00Z"
  },
  {
    id: "2",
    title: "Frontend Developer",
    company: "DesignCo",
    location: "Remote",
    salary: "$110k - $140k",
    type: "Full-time",
    tags: ["Next.js", "Tailwind", "Figma"],
    postedAt: "2023-10-23T14:30:00Z"
  },
  {
    id: "3",
    title: "Backend Engineer",
    company: "DataFlow",
    location: "New York, NY",
    salary: "$130k - $170k",
    type: "Full-time",
    tags: ["Python", "Django", "PostgreSQL"],
    postedAt: "2023-10-22T09:15:00Z"
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudScale",
    location: "Austin, TX",
    salary: "$120k - $160k",
    type: "Full-time",
    tags: ["AWS", "Docker", "Kubernetes"],
    postedAt: "2023-10-21T11:45:00Z"
  },
  {
    id: "5",
    title: "Machine Learning Engineer",
    company: "AI Systems",
    location: "Remote",
    salary: "$150k - $200k",
    type: "Full-time",
    tags: ["Python", "PyTorch", "TensorFlow"],
    postedAt: "2023-10-20T16:20:00Z"
  },
  {
    id: "6",
    title: "iOS Developer",
    company: "MobileFirst",
    location: "Seattle, WA",
    salary: "$130k - $160k",
    type: "Full-time",
    tags: ["Swift", "iOS", "CoreData"],
    postedAt: "2023-10-19T08:00:00Z"
  },
  {
    id: "7",
    title: "Android Developer",
    company: "AppWorks",
    location: "Chicago, IL (Hybrid)",
    salary: "$125k - $155k",
    type: "Full-time",
    tags: ["Kotlin", "Android", "Jetpack"],
    postedAt: "2023-10-18T13:10:00Z"
  },
  {
    id: "8",
    title: "Principal Software Engineer",
    company: "FinTech Solutions",
    location: "New York, NY",
    salary: "$180k - $220k",
    type: "Full-time",
    tags: ["Java", "Spring Boot", "Microservices"],
    postedAt: "2023-10-17T10:30:00Z"
  },
  {
    id: "9",
    title: "Security Engineer",
    company: "CyberShield",
    location: "Remote",
    salary: "$140k - $175k",
    type: "Full-time",
    tags: ["Security", "Network", "Pentesting"],
    postedAt: "2023-10-16T15:45:00Z"
  },
  {
    id: "10",
    title: "Data Engineer",
    company: "BigData Inc",
    location: "San Francisco, CA",
    salary: "$135k - $165k",
    type: "Full-time",
    tags: ["Spark", "Hadoop", "Scala"],
    postedAt: "2023-10-15T09:20:00Z"
  },
  {
    id: "11",
    title: "Full Stack Developer",
    company: "StartupX",
    location: "Remote",
    salary: "$100k - $130k",
    type: "Full-time",
    tags: ["Vue.js", "Ruby on Rails", "SQL"],
    postedAt: "2023-10-14T11:00:00Z"
  },
  {
    id: "12",
    title: "Site Reliability Engineer",
    company: "GlobalTech",
    location: "Boston, MA",
    salary: "$130k - $170k",
    type: "Full-time",
    tags: ["Linux", "Terraform", "CI/CD"],
    postedAt: "2023-10-13T14:15:00Z"
  },
  {
    id: "13",
    title: "QA Automation Engineer",
    company: "TestPro",
    location: "Denver, CO",
    salary: "$95k - $125k",
    type: "Full-time",
    tags: ["Selenium", "Cypress", "JS"],
    postedAt: "2023-10-12T16:30:00Z"
  },
  {
    id: "14",
    title: "Embedded Systems Engineer",
    company: "HardwareCorp",
    location: "San Diego, CA",
    salary: "$115k - $145k",
    type: "Full-time",
    tags: ["C", "C++", "RTOS"],
    postedAt: "2023-10-11T08:45:00Z"
  },
  {
    id: "15",
    title: "Blockchain Developer",
    company: "CryptoWeb",
    location: "Remote",
    salary: "$160k - $200k",
    type: "Full-time",
    tags: ["Solidity", "Web3.js", "Rust"],
    postedAt: "2023-10-10T10:00:00Z"
  },
  {
    id: "16",
    title: "Frontend Architect",
    company: "Enterprise UI",
    location: "London, UK",
    salary: "$150k - $190k",
    type: "Full-time",
    tags: ["React", "Microfrontends", "Webpack"],
    postedAt: "2023-10-09T13:20:00Z"
  },
  {
    id: "17",
    title: "Backend Go Developer",
    company: "FastAPI",
    location: "Remote",
    salary: "$120k - $150k",
    type: "Full-time",
    tags: ["Go", "gRPC", "Kubernetes"],
    postedAt: "2023-10-08T09:10:00Z"
  },
  {
    id: "18",
    title: "Cloud Architect",
    company: "AzureSystems",
    location: "Seattle, WA",
    salary: "$170k - $210k",
    type: "Full-time",
    tags: ["Azure", "Cloud Native", "Arch"],
    postedAt: "2023-10-07T11:50:00Z"
  },
  {
    id: "19",
    title: "Game Developer",
    company: "PlayStudios",
    location: "Los Angeles, CA",
    salary: "$110k - $140k",
    type: "Full-time",
    tags: ["Unity", "C#", "3D Math"],
    postedAt: "2023-10-06T15:00:00Z"
  },
  {
    id: "20",
    title: "Technical Product Manager",
    company: "TechBridge",
    location: "New York, NY",
    salary: "$140k - $170k",
    type: "Full-time",
    tags: ["Product", "Agile", "Specs"],
    postedAt: "2023-10-05T14:40:00Z"
  }
];
