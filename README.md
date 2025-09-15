# PAR Genie

AI-powered report assistant built during Hackathon 2025.

## Project Structure
- **Datasets/**: Report dataset JSON files.
- **PAR.PortalGenie.Py.Service/**: Python FastAPI AI microservice.
- **PAR.PortalGenie.Web.Service/**: .NET Core Web API backend.

## How to Run
### Python Service
```bash
cd PAR.PortalGenie.Py.Service
.venv\Scripts\activate
python -m uvicorn reports-service:app --reload --host 127.0.0.1 --port 8000
