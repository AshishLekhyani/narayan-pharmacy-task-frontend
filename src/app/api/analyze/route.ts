import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { drugs } = await request.json();

    // In a real application, you'd send `drugs` to Claude AI here.
    // We simulate the real API delay and structured JSON response.
    
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simple mock logic: if Warfarin and Aspirin are present, trigger high severity
    const drugNames = drugs.map((d: any) => d.name.toLowerCase());
    
    if (drugNames.some((d: string) => d.includes("warfarin")) && 
        drugNames.some((d: string) => d.includes("aspirin"))) {
      return NextResponse.json({
        severity: "High Severity",
        severityLevel: "high",
        primaryWarning: "Warfarin + Aspirin Interaction",
        clinicalImpact: [
          "Prolonged Prothrombin Time (PT) / INR levels.",
          "Heightened risk of spontaneous ecchymosis and bleeding.",
          "Antiplatelet effects are synergistically amplified."
        ],
        recommendation: "Consider alternative anti-thrombotic therapy or strictly monitor INR daily. Patient should be counseled on signs of internal bleeding immediately.",
        processedBy: "Claude-3-Haiku-Clinical-v1"
      });
    }

    // Default mock response if no conflict
    return NextResponse.json({
      severity: "Safe",
      severityLevel: "none",
      primaryWarning: "No Critical Interactions Found",
      clinicalImpact: [
        "Metabolic pathways do not heavily intersect.",
        "Clearance rates are stable for this combination."
      ],
      recommendation: "Proceed with standard dispensing protocol. Monitor patient for general adverse effects.",
      processedBy: "Claude-3-Haiku-Clinical-v1"
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to process prescription" }, { status: 500 });
  }
}
