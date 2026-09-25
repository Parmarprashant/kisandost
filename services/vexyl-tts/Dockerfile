FROM python:3.11-slim

# System dependencies: libgomp1 for PyTorch OpenMP, libsndfile1 for soundfile, git for Parler-TTS
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgomp1 libsndfile1 git curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install PyTorch CPU-only first for layer caching
RUN pip install --no-cache-dir \
    torch torchaudio \
    --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service code
COPY . .

ENV VEXYL_TTS_HOST=0.0.0.0
ENV VEXYL_TTS_PORT=8092
ENV PORT=8092
ENV VEXYL_TTS_DEVICE=cpu
ENV VEXYL_TTS_CACHE_SIZE=200

EXPOSE 8092

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8092/health || exit 1

CMD ["python", "vexyl_tts_server.py"]
