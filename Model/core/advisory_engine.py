"""
Agronomic Advisory Engine
Generates tailored Chemical, Biological, and Cultural treatments based on
disease identity, pest presence, and lesion severity percentage.
"""

def generate_advisory(disease_name: str, pest_count: int, severity_pct: float, land_acres: float = 1.0):
    """
    Synthesizes multi-model outputs into an actionable agronomic advisory.
    """
    # 1. Chemical treatment
    if "Blight" in disease_name:
        chemical_name = "Mancozeb 75% WP + Azoxystrobin 23% SC"
        base_dose_per_acre = 400.0  # grams or ml
        spray_instruction = "Mix 2.5g per liter of clean water. Apply thorough coverage on upper and lower leaf surfaces."
    elif "Rust" in disease_name:
        chemical_name = "Propiconazole 25% EC"
        base_dose_per_acre = 200.0
        spray_instruction = "Dilute 1ml per liter of water. Apply at first sign of rust pustule appearance."
    elif "Mildew" in disease_name:
        chemical_name = "Wettable Sulfur 80% WP"
        base_dose_per_acre = 500.0
        spray_instruction = "Dilute 3g per liter of water. Do not apply during extreme midday temperatures (>32°C)."
    elif "Healthy" in disease_name:
        chemical_name = "None (Preventive Micronutrient Spray Recommended)"
        base_dose_per_acre = 0.0
        spray_instruction = "Crops show vigorous foliar health. Maintain routine monitoring."
    else:
        chemical_name = "Copper Oxychloride 50% WP"
        base_dose_per_acre = 500.0
        spray_instruction = "Mix 3g per liter of water for broad-spectrum prophylactic protection."

    # Acreage dosage scaling
    total_dose = round(base_dose_per_acre * land_acres, 1)

    # 2. Biological / Organic options
    biological_remedies = [
        "Spray 5% Neem Seed Kernel Extract (NSKE) at early onset",
        "Apply Trichoderma viride bio-fungicide (2.5 kg/ha mixed with well-decomposed FYM)",
        "Release Trichogramma parasitic wasps if caterpillar/bollworm larvae detected"
    ]

    # 3. Cultural & Agronomic practices
    cultural_practices = [
        "Prune and burn heavily infected foliage to prevent airborne spore propagation",
        "Avoid overhead sprinkler irrigation; transition to drip irrigation to keep canopy dry",
        "Maintain clean field borders and eradicate alternative weed hosts",
        "Rotate crops with non-host leguminous crops next season"
    ]

    # 4. Urgency evaluation based on lesion severity %
    if severity_pct > 30.0 or pest_count > 10:
        urgency = "HIGH (Immediate Intervention Required within 24 Hours)"
    elif severity_pct >= 10.0 or pest_count > 0:
        urgency = "MODERATE (Schedule Application within 48 Hours)"
    else:
        urgency = "LOW (Preventive Monitoring Mode)"

    return {
        "urgency": urgency,
        "calibrated_dose_text": f"Approximate required dose: {total_dose} ml/g for your {land_acres} acre(s).",
        "chemical_treatment": {
            "active_ingredient": chemical_name,
            "dose_per_acre": f"{base_dose_per_acre} g/ml per acre",
            "total_dose_for_farm": f"{total_dose} g/ml",
            "instructions": spray_instruction
        },
        "biological_remedies": biological_remedies,
        "cultural_practices": cultural_practices
    }
