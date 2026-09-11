"""
API Data Contracts (Pydantic Schemas)
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DiagnosisRequest(BaseModel):
    land_acres: Optional[float] = Field(default=1.0, description="Farmer land area in acres for dosage scaling")

class PestDetectionItem(BaseModel):
    label: str
    confidence: float
    box: List[float]

class DiagnosisResponse(BaseModel):
    status: str
    pipeline_summary: Dict[str, Any]
    diagnosis: Dict[str, Any]
    pest_assessment: Dict[str, Any]
    lesion_quantification: Dict[str, Any]
    advisory: Dict[str, Any]
    fallback_metadata: Optional[Dict[str, Any]] = None
