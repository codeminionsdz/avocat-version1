import type { AIQuestion, LegalCategory } from "./types"

export const aiQuestions: Record<LegalCategory, AIQuestion[]> = {
  criminal: [
    {
      id: "c1",
      question: "What type of criminal matter do you need help with?",
      options: ["Traffic violation", "Theft accusation", "Assault case", "Other criminal matter"],
    },
    {
      id: "c2",
      question: "Have you been formally charged?",
      options: ["Yes, I received charges", "No, not yet", "I am not sure"],
    },
  ],
  family: [
    {
      id: "f1",
      question: "What family matter do you need assistance with?",
      options: ["Divorce", "Child custody", "Inheritance", "Marriage contract"],
    },
    {
      id: "f2",
      question: "Are there children involved in this matter?",
      options: ["Yes", "No"],
    },
  ],
  civil: [
    {
      id: "ci1",
      question: "What type of civil matter is this?",
      options: ["Property dispute", "Contract issue", "Personal injury", "Other civil matter"],
    },
  ],
  commercial: [
    {
      id: "co1",
      question: "What is the nature of your business issue?",
      options: ["Contract negotiation", "Business dispute", "Company registration", "Licensing"],
    },
  ],
  administrative: [
    {
      id: "a1",
      question: "What administrative issue are you facing?",
      options: ["Government permit", "License application", "Administrative appeal", "Other"],
    },
  ],
  labor: [
    {
      id: "l1",
      question: "What is your employment concern?",
      options: ["Wrongful termination", "Unpaid wages", "Workplace harassment", "Contract dispute"],
    },
  ],
  immigration: [
    {
      id: "i1",
      question: "What immigration matter do you need help with?",
      options: ["Visa application", "Residency permit", "Deportation defense", "Citizenship"],
    },
  ],
}

export const categoryLabels: Record<LegalCategory, string> = {
  criminal: "Criminal Law",
  family: "Family Law",
  civil: "Civil Law",
  commercial: "Commercial Law",
  administrative: "Administrative Law",
  labor: "Labor & Social Law",
  immigration: "Immigration Law",
}
