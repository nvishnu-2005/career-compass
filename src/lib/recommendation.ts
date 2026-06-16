export type Qualification =
  | "High School"
  | "Diploma"
  | "Undergraduate"
  | "Master's"
  | "MPhil"
  | "PhD";

export type RecommendationType =
  | "Certification Program"
  | "DBA (Doctor of Business Administration)"
  | "PhD"
  | "Honorary Doctorate";

export interface RecommendationInput {
  qualification: Qualification | string;
  workExperience: number;
  careerGoal: string;
}

export interface RecommendationResult {
  title: RecommendationType;
  explanation: string;
  whyItSuits: string;
  nextSteps: string[];
}

const researchKeywords = ["research", "academic", "phd", "scholar", "publish", "publication", "professor", "thesis", "scientist", "innovation"];
const leadershipKeywords = ["leadership", "ceo", "founder", "board", "executive", "director", "vp", "vice president", "senior manager", "thought leader", "industry leader", "philanthropy"];

export function generateRecommendation(input: RecommendationInput): RecommendationResult {
  const goal = input.careerGoal.toLowerCase();
  const years = Number(input.workExperience) || 0;
  const q = input.qualification;

  const wantsResearch = researchKeywords.some((k) => goal.includes(k));
  const hasLeadership = leadershipKeywords.some((k) => goal.includes(k));

  // Honorary Doctorate: 15+ years + leadership signals
  if (years >= 15 && hasLeadership) {
    return {
      title: "Honorary Doctorate",
      explanation:
        "An Honorary Doctorate recognizes outstanding achievements, leadership, and contributions to your industry or society.",
      whyItSuits:
        "Your extensive experience and demonstrated leadership make you an ideal candidate for recognition through an honorary doctoral title.",
      nextSteps: [
        "Compile a portfolio of your achievements, awards, and public contributions.",
        "Request endorsement letters from industry peers and institutions.",
        "Apply to accredited institutions offering honorary doctorate nominations.",
      ],
    };
  }

  // PhD: Research interest (any qualification with master's-equivalent or higher preferred)
  if (wantsResearch && (q === "Master's" || q === "MPhil" || q === "PhD" || years >= 5)) {
    return {
      title: "PhD",
      explanation:
        "A PhD is the highest academic research degree, focused on original contributions to knowledge in your field.",
      whyItSuits:
        "Your research interests and academic background align with the deep, original inquiry that a PhD demands.",
      nextSteps: [
        "Identify a research area and potential supervisors.",
        "Draft a research proposal outlining your question and methodology.",
        "Apply to PhD programs and explore scholarship opportunities.",
      ],
    };
  }

  // DBA: Master's + 3-8 years
  if (q === "Master's" && years >= 3) {
    return {
      title: "DBA (Doctor of Business Administration)",
      explanation:
        "The DBA is a professional doctorate designed for experienced executives who want to apply advanced research to real business problems.",
      whyItSuits:
        "With a Master's degree and substantial professional experience, you're well-positioned to bridge academic rigor and executive practice.",
      nextSteps: [
        "Identify a business challenge in your industry worth investigating.",
        "Shortlist accredited DBA programs with strong executive cohorts.",
        "Prepare your research statement and professional CV for application.",
      ],
    };
  }

  // Default: Certification Program for early-career or those without advanced degrees
  return {
    title: "Certification Program",
    explanation:
      "A Certification Program is a fast, focused way to build credentials and acquire in-demand skills for your career stage.",
    whyItSuits:
      "Given your current background and experience, a certification will help you specialize, upskill, and unlock the next step in your career.",
    nextSteps: [
      "Choose a certification aligned with your target role or industry.",
      "Commit to a study schedule and complete the assessment.",
      "Showcase the credential on your CV and LinkedIn profile.",
    ],
  };
}
