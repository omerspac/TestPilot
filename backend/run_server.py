import asyncio
import sys
import uvicorn

if sys.platform == "win32":
    # Use ProactorEventLoopPolicy, which supports subprocesses on Windows
    policy = asyncio.WindowsProactorEventLoopPolicy()
    asyncio.set_event_loop_policy(policy)
    
if __name__ == "__main__":
    # Disable reload=True as it can interfere with subprocess management
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
