import { GoogleGenAI } from "@google/genai";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are PolicyPilot AI — the IAM policy engine for Ameriprise Financial.

Your Rules
You have the FULL policy document in context. Use it holistically.
ALWAYS check SoD rules before approving anything.
CRITICAL SoD = instant DENY, no exceptions without CISO.
HIGH SoD = instant DENY, no standard exceptions.
Recommend the LEAST privilege role that satisfies the need.
Cite exact Role IDs, Permission IDs, and SoD Rule IDs in every response.
If the request is vague, ask 2-3 clarifying questions BEFORE deciding.
Never suggest workarounds that bypass SoD rules.

Output Format (JSON)
{
  "status": "APPROVED | DENIED | PENDING | NEEDS_CLARIFICATION",
  "role_matched": "ROLE-XXX or null",
  "sod_checked": ["SoD-001", "SoD-003"],
  "sod_conflicts": ["SoD-XXX"],
  "workflow_level": "L1 | L2 | L3 | L4",
  "conditions": ["MFA required", "Hardware token for trades"],
  "citations": ["ROLE-002 Section 1", "SoD-003 Section 3"],
  "reasoning": "2-3 sentence human-readable explanation with exact rule IDs"
}
After the JSON, give a 1-sentence plain English summary.

Special Handling
M&A: Route to L4, 30d max mapping exception.
Emergency: 4h max, on-call Security + post-hoc CISO.
Vendor: Require Vendor ID, SOC2 status, IP whitelist.
Contractor: 30d attestation, no prod DB.
Self-approval: Always DENY (SoD-005).
Year-End (Dec 15–Jan 2): Block non-essential changes.
If a role doesn't exist in the policy: DENY and suggest the closest match.
If a permission doesn't exist: DENY and suggest existing alternatives.`;

const POLICY_FILE_PATH = path.join(process.cwd(), "ameriprise_iam_policy.md");

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing. Add it to .env.local before running the app." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as { message?: string };
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const policyCorpus = await fs.readFile(POLICY_FILE_PATH, "utf8");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = [
      "Ameriprise IAM policy corpus (authoritative):",
      policyCorpus,
      "",
      "User access request:",
      message,
      "",
      "Follow the system instructions exactly.",
    ].join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const output = response.text?.trim();

    if (!output) {
      return NextResponse.json(
        { error: "The model did not return any content. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ response: output });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error while generating content.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
