// Static data file for all tools
export interface Tool {
  id: string
  name: string
  description: string
  shortDescription: string
  icon: string
  apiEndpoint?: string
  features?: string[]
  categories?: {
    name: string
    items: string[]
  }[]
}
export const BASE_URL = "http://localhost:3000"
export const tools: Tool[] = [
  {
    id: "secureapk",
    name: "secureAPK",
    description:
      "Comprehensive APK vulnerability scanner that decompiles and analyzes Android applications for security issues",
    shortDescription:
      "Scan APK files for cryptographic issues, data leakage, insecure configurations, and native code vulnerabilities",
    icon: "shield-check",
    apiEndpoint: `${BASE_URL}/api/secureapk`,
    features: [
      "Decompiles APK using Apktool",
      "Scans for cryptographic vulnerabilities",
      "Detects hardcoded secrets and API keys",
      "Analyzes native .so files for security issues",
      "Identifies insecure configurations",
    ],
    categories: [
      {
        name: "Cryptographic Issues",
        items: ["Insecure cryptographic algorithms", "Weak random number generation", "Private keys in source code"],
      },
      {
        name: "Data Leakage & Secrets",
        items: ["API keys and authentication tokens", "Hardcoded HTTP URLs", "Passwords and secrets in code"],
      },
      {
        name: "WebView & Network Issues",
        items: ["Insecure WebView settings", "Weak SSL/TLS protocols", "Missing certificate validation"],
      },
      {
        name: "Native Code Analysis",
        items: [
          "Stack protection checks",
          "ROP gadgets detection",
          "Format string vulnerabilities",
          "Unsafe function usage",
        ],
      },
    ],
  },
  {
    id: "reconizex",
    name: "ReconizeX",
    description:
      "Template-based static analysis of Android applications to detect secrets, keys, and security vulnerabilities",
    shortDescription: "Find secrets, keys, weak coding practices & many more security vulnerabilities in Android apps",
    icon: "shield-alert",
    apiEndpoint: `${BASE_URL}/api/reconizex`,
    features: [
      "Template-based static analysis",
      "Detects API keys and secrets",
      "Identifies security vulnerabilities",
      "Finds weak coding practices",
    ],
    categories: [
      {
        name: "API Keys & Secrets",
        items: [
          "AWS Access Key ID",
          "Twitter Secret",
          "Mailchimp API Key",
          "Google API Key",
          "Facebook Client ID",
          "Stripe API Key",
        ],
      },
      {
        name: "Security Vulnerabilities",
        items: [
          "Biometric/Fingerprint Detection",
          "Webview JavaScript Enabled",
          "ADB Backup Enabled",
          "Improper Certificate Validation",
          "Cleartext Storage",
        ],
      },
      {
        name: "Code Vulnerabilities",
        items: ["SQL Injection", "Path Traversal", "Hardcoded Crypto Keys", "Insecure Random", "Command Execution"],
      },
    ],
  },
  {
    id: "template-tool",
    name: "Template Tool",
    description: "A template tool for APK security analysis",
    shortDescription: "Analyze APK files for security vulnerabilities and potential issues",
    icon: "shield",
    apiEndpoint: "/api/template-tool",
  },
]

export function getTool(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id)
}

